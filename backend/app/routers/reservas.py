from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.reserva import Reserva
from app.models.factura import Factura
from app.models.servicio import Servicio
from app.models.usuario import Usuario
from app.models.venta import Venta, DetalleVenta
from app.schemas.reserva import CrearReserva, FacturaRespuesta
from app.core.dependencies import obtener_usuario_actual, requiere_rol
from sqlalchemy import func as sql_func

router = APIRouter(prefix="/api/reservas", tags=["Reservas"])


@router.post("/", response_model=FacturaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_reserva(
    datos: CrearReserva,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    total = 0
    servicios_validados = []

    # Validar que todos los servicios existan y estén activos ANTES de crear nada
    for item in datos.items:
        servicio = db.query(Servicio).filter(
            Servicio.id_servicio == item.id_servicio,
            Servicio.estado == True
        ).first()

        if not servicio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El servicio con id {item.id_servicio} no existe o no está disponible"
            )

        if servicio.cupo_maximo and item.cantidad > servicio.cupo_maximo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{servicio.nombre}' tiene un cupo máximo de {servicio.cupo_maximo} personas"
            )

        subtotal = servicio.precio * item.cantidad
        total += subtotal
        servicios_validados.append((servicio, item.cantidad, subtotal))

    # Crear la factura
    nueva_factura = Factura(
        id_usuario=usuario_actual.id_usuario,
        total=total,
        estado="Emitida"
    )
    db.add(nueva_factura)
    db.flush()  # para obtener el id_factura antes del commit final

    # Crear una reserva por cada servicio, asociada a la misma factura
    for servicio, cantidad, _ in servicios_validados:
        nueva_reserva = Reserva(
            id_usuario=usuario_actual.id_usuario,
            id_servicio=servicio.id_servicio,
            cantidad=cantidad,
            estado=True,
            id_factura=nueva_factura.id_factura,
            precio_unitario=servicio.precio
        )
        db.add(nueva_reserva)
    # Registrar la venta asociada a la factura
    nueva_venta = Venta(
        id_cliente=usuario_actual.id_usuario,
        id_usuario_registra=None,   # compra hecha por el propio cliente desde la web
        id_factura=nueva_factura.id_factura,
        subtotal=total,
        descuento=0,
        impuesto=0,
        total=total,
        estado="Completada"
    )
    db.add(nueva_venta)
    db.flush()  # para obtener id_venta

    # Una línea de detalle por cada servicio comprado
    for servicio, cantidad, subtotal in servicios_validados:
        db.add(DetalleVenta(
            id_venta=nueva_venta.id_venta,
            id_servicio=servicio.id_servicio,
            cantidad=cantidad,
            precio_unitario=servicio.precio,
            descuento=0,
            subtotal=subtotal
        ))

    db.commit()
    db.refresh(nueva_factura)

    return _serializar_factura(nueva_factura)


@router.get("/mis-facturas", response_model=List[FacturaRespuesta])
def mis_facturas(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    facturas = (
        db.query(Factura)
        .filter(Factura.id_usuario == usuario_actual.id_usuario)
        .options(joinedload(Factura.reservas).joinedload(Reserva.servicio))
        .order_by(Factura.fecha_emision.desc())
        .all()
    )
    return [_serializar_factura(f) for f in facturas]


@router.get("/factura/{id_factura}", response_model=FacturaRespuesta)
def obtener_factura(
    id_factura: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    factura = (
        db.query(Factura)
        .filter(Factura.id_factura == id_factura)
        .options(joinedload(Factura.reservas).joinedload(Reserva.servicio))
        .first()
    )

    if not factura:
        raise HTTPException(status_code=404, detail="Factura no encontrada")

    # Solo el dueño de la factura, o Admin/Empleado, pueden verla
    es_dueno = factura.id_usuario == usuario_actual.id_usuario
    es_gestion = usuario_actual.rol.nombre in ("Administrador", "Empleado")

    if not es_dueno and not es_gestion:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta factura")

    return _serializar_factura(factura)


def _serializar_factura(factura: Factura) -> dict:
    return {
        "id_factura": factura.id_factura,
        "fecha_emision": factura.fecha_emision,
        "total": factura.total,
        "estado": factura.estado,
        "reservas": [
            {
                "id_reserva": r.id_reserva,
                "id_servicio": r.id_servicio,
                "servicio": r.servicio,
                "cantidad": r.cantidad,
                "precio_unitario": r.precio_unitario,
                "subtotal": r.precio_unitario * r.cantidad,
                "fecha_reserva": r.fecha_reserva,
                "estado": r.estado,
            }
            for r in factura.reservas
        ],
    }


@router.get("/estadisticas")
def estadisticas_reservas(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado"))
):
    resultados = (
        db.query(
            Servicio.id_servicio,
            Servicio.nombre,
            Servicio.categoria,
            sql_func.coalesce(sql_func.sum(Reserva.cantidad), 0).label("total_personas"),
            sql_func.count(Reserva.id_reserva).label("veces_reservado"),
        )
        .outerjoin(Reserva, Reserva.id_servicio == Servicio.id_servicio)
        .group_by(Servicio.id_servicio, Servicio.nombre, Servicio.categoria)
        .order_by(sql_func.coalesce(sql_func.sum(Reserva.cantidad), 0).desc())
        .all()
    )

    return [
        {
            "id_servicio": r.id_servicio,
            "nombre": r.nombre,
            "categoria": r.categoria,
            "total_personas": int(r.total_personas),
            "veces_reservado": int(r.veces_reservado),
        }
        for r in resultados
    ]

@router.get("/estadisticas/{id_servicio}/detalle")
def detalle_reservas_servicio(
    id_servicio: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado"))
):
    reservas = (
        db.query(Reserva)
        .filter(Reserva.id_servicio == id_servicio)
        .options(joinedload(Reserva.usuario))
        .order_by(Reserva.fecha_reserva.desc())
        .all()
    )

    return [
        {
            "id_reserva": r.id_reserva,
            "nombre_cliente": f"{r.usuario.nombre} {r.usuario.apellido}",
            "correo_cliente": r.usuario.correo,
            "cantidad": r.cantidad,
            "fecha_reserva": r.fecha_reserva,
            "estado": "Activa" if r.estado else "Cancelada",
        }
        for r in reservas
    ]