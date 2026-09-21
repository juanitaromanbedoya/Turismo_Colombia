import re
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.factura import Factura
from app.models.reserva import Reserva
from app.models.usuario import Usuario
from app.models.venta import Venta
from app.schemas.factura import FacturaVentaRespuesta, FacturaResumen
from app.core.dependencies import obtener_usuario_actual
from fastapi.responses import Response
from app.core.factura_pdf import generar_pdf_factura

router = APIRouter(prefix="/api/facturas", tags=["Facturas"])


def construir_factura_venta(factura: Factura, venta: Optional[Venta]) -> dict:
    cliente = factura.usuario

    items = []
    for r in factura.reservas:
        precio = r.precio_unitario if r.precio_unitario is not None else r.servicio.precio
        items.append(
            {
                "servicio": r.servicio.nombre,
                "cantidad": r.cantidad,
                "precio_unitario": precio,
                "subtotal": precio * r.cantidad,
            }
        )

    return {
        "id_factura": factura.id_factura,
        "numero_factura": factura.numero_factura,
        "numero_venta": venta.numero_venta if venta else None,
        "fecha_emision": factura.fecha_emision,
        "cliente": {
            "nombre_completo": f"{cliente.nombre} {cliente.apellido}",
            "tipo_documento": cliente.tipo_documento,
            "numero_documento": cliente.numero_documento,
            "direccion": cliente.direccion,
            "telefono": cliente.telefono,
            "correo": cliente.correo,
        },
        "items": items,
        "subtotal": sum((i["subtotal"] for i in items), Decimal("0")),
        "descuento": venta.descuento if venta else Decimal("0"),
        "impuesto": venta.impuesto if venta else Decimal("0"),
        "total": factura.total,
        "estado": factura.estado,
    }


def _factura_autorizada(db: Session, id_factura: int, usuario: Usuario) -> dict:
    factura = (
        db.query(Factura)
        .options(
            joinedload(Factura.usuario),
            joinedload(Factura.reservas).joinedload(Reserva.servicio),
        )
        .filter(Factura.id_factura == id_factura)
        .first()
    )

    if not factura:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Factura no encontrada"
        )

    # Solo el dueño de la factura, o Admin/Empleado, pueden verla
    es_gestion = usuario.rol.nombre in ("Administrador", "Empleado")
    if not es_gestion and factura.id_usuario != usuario.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta factura",
        )

    venta = db.query(Venta).filter(Venta.id_factura == factura.id_factura).first()
    return construir_factura_venta(factura, venta)


@router.get("/{id_factura}", response_model=FacturaVentaRespuesta)
def obtener_factura_venta(
    id_factura: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    return _factura_autorizada(db, id_factura, usuario_actual)


@router.get("/{id_factura}/pdf")
def descargar_factura_pdf(
    id_factura: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    factura = _factura_autorizada(db, id_factura, usuario_actual)
    pdf = generar_pdf_factura(factura)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{factura["numero_factura"]}.pdf"'
        },
    )

@router.get("/", response_model=List[FacturaResumen])
def buscar_facturas(
    numero: Optional[str] = Query(None, max_length=20),
    cliente: Optional[str] = Query(None, max_length=100),
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    pagina: int = Query(1, ge=1),
    limite: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha inicial no puede ser mayor que la fecha final",
        )

    query = db.query(Factura).options(joinedload(Factura.usuario))

    # Seguridad: Admin y Empleado ven todas las facturas; los demás solo las suyas
    es_gestion = usuario_actual.rol.nombre in ("Administrador", "Empleado")
    if not es_gestion:
        query = query.filter(Factura.id_usuario == usuario_actual.id_usuario)

    # Número de factura: acepta "FAC-000012", "000012" o "12"
    if numero and numero.strip():
        digitos = re.sub(r"\D", "", numero)
        if not digitos:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El número de factura debe tener dígitos, por ejemplo FAC-000012 o 12",
            )
        if len(digitos) > 9:
            return []
        query = query.filter(Factura.id_factura == int(digitos))

    # Cliente: por nombre completo o número de documento (solo para Admin y Empleado)
    if cliente and cliente.strip() and es_gestion:
        patron = f"%{cliente.strip()}%"
        query = query.filter(
            Factura.usuario.has(
                or_(
                    (Usuario.nombre + " " + Usuario.apellido).ilike(patron),
                    Usuario.numero_documento.ilike(patron),
                )
            )
        )

    # Fechas: inclusivas de día completo
    if fecha_desde:
        query = query.filter(
            Factura.fecha_emision >= datetime.combine(fecha_desde, datetime.min.time())
        )
    if fecha_hasta:
        query = query.filter(
            Factura.fecha_emision
            < datetime.combine(fecha_hasta + timedelta(days=1), datetime.min.time())
        )

    facturas = (
        query.order_by(Factura.fecha_emision.desc(), Factura.id_factura.desc())
        .offset((pagina - 1) * limite)
        .limit(limite)
        .all()
    )

    # Ventas de esta página en una sola consulta (para mostrar el número de venta)
    ids = [f.id_factura for f in facturas]
    ventas = {}
    if ids:
        ventas = {
            v.id_factura: v
            for v in db.query(Venta).filter(Venta.id_factura.in_(ids)).all()
        }

    return [
        {
            "id_factura": f.id_factura,
            "numero_factura": f.numero_factura,
            "numero_venta": ventas[f.id_factura].numero_venta if f.id_factura in ventas else None,
            "fecha_emision": f.fecha_emision,
            "cliente": f"{f.usuario.nombre} {f.usuario.apellido}",
            "numero_documento": f.usuario.numero_documento,
            "total": f.total,
            "estado": f.estado,
        }
        for f in facturas
    ]