from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models.reserva import Reserva
from app.models.factura import Factura
from app.models.servicio import Servicio
from app.models.usuario import Usuario
from app.schemas.reserva import CrearReserva, FacturaRespuesta
from app.core.dependencies import obtener_usuario_actual, requiere_rol

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