from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload, selectinload
from fastapi.responses import Response
from app.core.reporte_pdf import generar_pdf_reporte

# Usa los mismos imports que ya tienes en el router de reservas para:
# get_db, obtener_usuario_actual y Usuario
from app.models.venta import Venta, DetalleVenta
from app.models.servicio import Servicio
from app.database import get_db
from app.models.usuario import Usuario
from app.core.dependencies import obtener_usuario_actual, requiere_rol
from app.core.reporte_excel import generar_excel_reporte
from app.schemas.venta import VentaRespuesta, ReporteDiario

router = APIRouter(prefix="/api/ventas", tags=["Ventas"])

@router.get("/", response_model=List[VentaRespuesta])
def historial_ventas(
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    cliente: Optional[str] = Query(None, max_length=100),
    servicio: Optional[str] = Query(None, max_length=100),
    estado: Optional[Literal["Pendiente", "Completada", "Anulada"]] = None,
    valor_min: Optional[Decimal] = Query(None, ge=0),
    valor_max: Optional[Decimal] = Query(None, ge=0),
    pagina: int = Query(1, ge=1),
    limite: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha inicial no puede ser mayor que la fecha final"
        )
    if valor_min is not None and valor_max is not None and valor_min > valor_max:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El valor mínimo no puede ser mayor que el valor máximo"
        )

    query = db.query(Venta).options(
        joinedload(Venta.cliente),
        selectinload(Venta.detalles).joinedload(DetalleVenta.servicio),
    )

    # Seguridad: Admin y Empleado ven todas las ventas; cualquier otro rol solo las suyas
    es_gestion = usuario_actual.rol.nombre in ("Administrador", "Empleado")
    if not es_gestion:
        query = query.filter(Venta.id_cliente == usuario_actual.id_usuario)

    # Filtros
    if fecha_desde:
        query = query.filter(
            Venta.fecha_venta >= datetime.combine(fecha_desde, datetime.min.time())
        )
    if fecha_hasta:
        # inclusivo: hasta el final del día indicado
        query = query.filter(
            Venta.fecha_venta < datetime.combine(fecha_hasta + timedelta(days=1), datetime.min.time())
        )
    if cliente and not es_gestion:
        patron = f"%{cliente.strip()}%"
        query = query.filter(Venta.cliente.has(or_(
            (Usuario.nombre + " " + Usuario.apellido).ilike(patron),
            Usuario.numero_documento.ilike(patron),
        )))
    if servicio:
        patron = f"%{servicio.strip()}%"
        query = query.filter(
            Venta.detalles.any(DetalleVenta.servicio.has(Servicio.nombre.ilike(patron)))
        )
    if estado:
        query = query.filter(Venta.estado == estado)
    if valor_min is not None:
        query = query.filter(Venta.total >= valor_min)
    if valor_max is not None:
        query = query.filter(Venta.total <= valor_max)

    return (
        query.order_by(Venta.fecha_venta.desc(), Venta.id_venta.desc())
        .offset((pagina - 1) * limite)
        .limit(limite)
        .all()
    )

def construir_reporte(db: Session, fecha: date, usuario: Usuario) -> dict:
    inicio = datetime.combine(fecha, datetime.min.time())
    fin = inicio + timedelta(days=1)

    ventas = (
        db.query(Venta)
        .options(
            joinedload(Venta.cliente),
            selectinload(Venta.detalles).joinedload(DetalleVenta.servicio),
        )
        .filter(Venta.fecha_venta >= inicio, Venta.fecha_venta < fin)
        .order_by(Venta.fecha_venta.asc(), Venta.id_venta.asc())
        .all()
    )

    filas = [
        {
            "numero_venta": v.numero_venta,
            "fecha_venta": v.fecha_venta,
            "cliente": f"{v.cliente.nombre} {v.cliente.apellido}",
            "items": [
                {
                    "servicio": d.servicio.nombre,
                    "cantidad": d.cantidad,
                    "precio_unitario": d.precio_unitario,
                    "subtotal": d.subtotal,
                }
                for d in v.detalles
            ],
            "total": v.total,
            "estado": v.estado,
        }
        for v in ventas
    ]

    return {
        "fecha": fecha,
        "ventas": filas,
        "cantidad_ventas": len(ventas),
        "cantidad_completadas": sum(1 for v in ventas if v.estado == "Completada"),
        "cantidad_pendientes": sum(1 for v in ventas if v.estado == "Pendiente"),
        "cantidad_anuladas": sum(1 for v in ventas if v.estado == "Anulada"),
        "total_vendido": sum(
            (v.total for v in ventas if v.estado == "Completada"), Decimal("0")
        ),
        "generado_por": f"{usuario.nombre} {usuario.apellido}",
        "generado_en": datetime.now(),
    }


@router.get("/reporte-diario", response_model=ReporteDiario)
def reporte_diario(
    fecha: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado")),
):
    fecha = fecha or date.today()

    if fecha > date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede generar un reporte de una fecha futura"
        )

    return construir_reporte(db, fecha, usuario_actual)

@router.get("/reporte-diario/pdf")
def reporte_diario_pdf(
    fecha: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado")),
):
    fecha = fecha or date.today()

    if fecha > date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede generar un reporte de una fecha futura"
        )

    reporte = construir_reporte(db, fecha, usuario_actual)
    pdf = generar_pdf_reporte(reporte)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_ventas_{fecha.isoformat()}.pdf"'
        },
    )

@router.get("/reporte-diario/excel")
def reporte_diario_excel(
    fecha: Optional[date] = None,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado")),
):
    fecha = fecha or date.today()

    if fecha > date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede generar un reporte de una fecha futura"
        )

    reporte = construir_reporte(db, fecha, usuario_actual)
    contenido = generar_excel_reporte(reporte)

    return Response(
        content=contenido,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="reporte_ventas_{fecha.isoformat()}.xlsx"'
        },
    )