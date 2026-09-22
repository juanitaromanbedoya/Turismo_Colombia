from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.factura import Factura
from app.models.pqr import PQR
from app.models.servicio import Servicio
from app.models.usuario import Usuario
from app.models.venta import Venta, DetalleVenta
from app.schemas.estadisticas import ResumenRespuesta, EstadisticasVentas
from app.core.dependencies import obtener_usuario_actual

router = APIRouter(prefix="/api/estadisticas", tags=["Estadísticas"])


def _contar(db: Session, columna, *condiciones) -> int:
    return db.query(func.count(columna)).filter(*condiciones).scalar() or 0


def _sumar(db: Session, columna, *condiciones) -> float:
    return float(
        db.query(func.coalesce(func.sum(columna), 0)).filter(*condiciones).scalar() or 0
    )


def _pesos(valor: float) -> str:
    return "$" + f"{valor:,.0f}".replace(",", ".")


def _porcentaje(parte: int, total: int) -> float:
    return round(parte * 100 / total, 1) if total else 0.0


def _tarjeta(
    clave, titulo, valor, formato="numero", detalle=None,
    porcentaje=None, etiqueta_porcentaje=None,
    lista_titulo=None, lista=None,
) -> dict:
    return {
        "clave": clave,
        "titulo": titulo,
        "valor": float(valor),
        "formato": formato,
        "detalle": detalle,
        "porcentaje": porcentaje,
        "etiqueta_porcentaje": etiqueta_porcentaje,
        "lista_titulo": lista_titulo,
        "lista": lista or [],
    }


def _detalle_servicios(db: Session, activos: int, inactivos: int) -> str:
    detalle = f"{activos} activos · {inactivos} inactivos"
    categorias = (
        db.query(Servicio.categoria, func.count(Servicio.id_servicio))
        .filter(Servicio.estado == True)
        .group_by(Servicio.categoria)
        .order_by(func.count(Servicio.id_servicio).desc())
        .all()
    )
    if categorias:
        partes = [
            f"{categoria or 'Sin categoría'} ({cantidad})"
            for categoria, cantidad in categorias[:4]
        ]
        detalle += "\nCategorías: " + ", ".join(partes)
    return detalle

def _lista_servicios(db: Session) -> list:
    servicios = (
        db.query(Servicio).order_by(Servicio.estado.desc(), Servicio.nombre).all()
    )
    return [
        {
            "titulo": s.nombre,
            "subtitulo": s.categoria or "Sin categoría",
            "valor": _pesos(float(s.precio)),
            "estado": "Activo" if s.estado else "Inactivo",
        }
        for s in servicios
    ]

def _tarjetas_ventas(db: Session) -> list:
    ventas = _contar(db, Venta.id_venta, Venta.estado == "Completada")
    pendientes = _contar(db, Venta.id_venta, Venta.estado == "Pendiente")
    anuladas = _contar(db, Venta.id_venta, Venta.estado == "Anulada")
    total = _sumar(db, Venta.total, Venta.estado == "Completada")

    return [
        _tarjeta(
            "ventas", "Ventas completadas", ventas,
            detalle=f"{pendientes} pendientes · {anuladas} anuladas",
        ),
        _tarjeta(
            "total_vendido", "Total vendido", total, "moneda",
            detalle=f"Ticket promedio: {_pesos(total / ventas)}" if ventas else None,
        ),
    ]


def _tarjetas_pqr(db: Session) -> list:
    total = _contar(db, PQR.id_pqr)
    pendientes = _contar(db, PQR.id_pqr, PQR.estado == "Pendiente")
    en_proceso = _contar(db, PQR.id_pqr, PQR.estado == "En proceso")
    resueltas = _contar(db, PQR.id_pqr, PQR.estado.in_(["Respondida", "Cerrada"]))

    return [
        _tarjeta("pqr_recibidas", "PQR recibidas", total, detalle=f"{resueltas} respondidas o cerradas"),
        _tarjeta("pqr_pendientes", "PQR pendientes", pendientes, detalle=f"{en_proceso} en proceso"),
    ]


def _tarjetas_administrador(db: Session) -> list:
    usuarios = _contar(db, Usuario.id_usuario)
    usuarios_activos = _contar(db, Usuario.id_usuario, Usuario.estado == True)
    clientes = _contar(db, Usuario.id_usuario, Usuario.rol.has(nombre="Cliente"))
    empleados = _contar(db, Usuario.id_usuario, Usuario.rol.has(nombre="Empleado"))
    administradores = _contar(db, Usuario.id_usuario, Usuario.rol.has(nombre="Administrador"))
    servicios = _contar(db, Servicio.id_servicio)
    servicios_activos = _contar(db, Servicio.id_servicio, Servicio.estado == True)
    facturas = _contar(db, Factura.id_factura, Factura.estado == "Emitida")
    facturado = _sumar(db, Factura.total, Factura.estado == "Emitida")

    return [
        _tarjeta(
            "usuarios", "Usuarios", usuarios,
            detalle=f"{clientes} clientes · {empleados} empleados · {administradores} administradores",
            porcentaje=_porcentaje(usuarios_activos, usuarios),
            etiqueta_porcentaje="activos",
        ),
        _tarjeta(
            "servicios", "Servicios", servicios,
            detalle=_detalle_servicios(db, servicios_activos, servicios - servicios_activos),
            porcentaje=_porcentaje(servicios_activos, servicios),
            etiqueta_porcentaje="activos",
            lista_titulo="Servicios de Turismo Colombia",
            lista=_lista_servicios(db),
        ),
        *_tarjetas_ventas(db),
        _tarjeta("facturacion", "Facturación", facturado, "moneda", f"{facturas} facturas emitidas"),
        *_tarjetas_pqr(db),
    ]


def _tarjetas_empleado(db: Session) -> list:
    servicios = _contar(db, Servicio.id_servicio)
    servicios_activos = _contar(db, Servicio.id_servicio, Servicio.estado == True)

    return [
        _tarjeta(
            "servicios_activos", "Servicios activos", servicios_activos,
            detalle=_detalle_servicios(db, servicios_activos, servicios - servicios_activos),
            porcentaje=_porcentaje(servicios_activos, servicios),
            etiqueta_porcentaje="activos",
            lista_titulo="Servicios de Turismo Colombia",
            lista=_lista_servicios(db),
        ),
        *_tarjetas_ventas(db),
        *_tarjetas_pqr(db),
    ]


def _tarjetas_cliente(db: Session, usuario: Usuario) -> list:
    mis_ventas = (Venta.id_cliente == usuario.id_usuario, Venta.estado == "Completada")
    compras = _contar(db, Venta.id_venta, *mis_ventas)
    gastado = _sumar(db, Venta.total, *mis_ventas)
    facturas = _contar(db, Factura.id_factura, Factura.id_usuario == usuario.id_usuario)
    pqr_total = _contar(db, PQR.id_pqr, PQR.id_usuario == usuario.id_usuario)
    pqr_pendientes = _contar(
        db, PQR.id_pqr, PQR.id_usuario == usuario.id_usuario, PQR.estado == "Pendiente"
    )
    pqr_resueltas = _contar(
        db, PQR.id_pqr, PQR.id_usuario == usuario.id_usuario,
        PQR.estado.in_(["Respondida", "Cerrada"]),
    )

    return [
        _tarjeta(
            "compras", "Mis compras", compras,
            detalle=f"Promedio por compra: {_pesos(gastado / compras)}" if compras else None,
        ),
        _tarjeta("gastado", "Total gastado", gastado, "moneda"),
        _tarjeta("facturas", "Mis facturas", facturas),
        _tarjeta("pqr_recibidas", "Mis PQR", pqr_total, detalle=f"{pqr_resueltas} respondidas o cerradas"),
        _tarjeta("pqr_pendientes", "PQR pendientes", pqr_pendientes),
    ]


@router.get("/resumen", response_model=ResumenRespuesta)
def resumen(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    rol = usuario_actual.rol.nombre

    if rol == "Administrador":
        tarjetas = _tarjetas_administrador(db)
    elif rol == "Empleado":
        tarjetas = _tarjetas_empleado(db)
    else:
        tarjetas = _tarjetas_cliente(db, usuario_actual)

    return {"rol": rol, "tarjetas": tarjetas}

# ---------------------------------------------------------------------------
# Estadísticas de ventas (para los gráficos)
# ---------------------------------------------------------------------------

def _inicio_periodo(fecha: date, agrupar: str) -> date:
    if agrupar == "semana":
        return fecha - timedelta(days=fecha.weekday())  # lunes de esa semana
    if agrupar == "mes":
        return fecha.replace(day=1)
    return fecha


def _siguiente_periodo(inicio: date, agrupar: str) -> date:
    if agrupar == "semana":
        return inicio + timedelta(days=7)
    if agrupar == "mes":
        if inicio.month == 12:
            return inicio.replace(year=inicio.year + 1, month=1)
        return inicio.replace(month=inicio.month + 1)
    return inicio + timedelta(days=1)


def _etiqueta_periodo(inicio: date, agrupar: str) -> str:
    if agrupar == "mes":
        return inicio.strftime("%m/%Y")
    if agrupar == "semana":
        return f"Sem {inicio.strftime('%d/%m')}"
    return inicio.strftime("%d/%m")


@router.get("/ventas", response_model=EstadisticasVentas)
def estadisticas_ventas(
    agrupar: Literal["dia", "semana", "mes"] = "dia",
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    servicio: Optional[str] = Query(None, max_length=100),
    cliente: Optional[str] = Query(None, max_length=100),
    estado: Literal["Pendiente", "Completada", "Anulada"] = "Completada",
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    hasta = fecha_hasta or date.today()
    desde = fecha_desde or (hasta - timedelta(days=29))

    if desde > hasta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha inicial no puede ser mayor que la fecha final",
        )
    if (hasta - desde).days > 366:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El rango máximo es de 366 días",
        )

    consulta = (
        db.query(
            Venta.id_venta,
            Venta.fecha_venta,
            Servicio.nombre,
            DetalleVenta.cantidad,
            DetalleVenta.subtotal,
        )
        .join(DetalleVenta, DetalleVenta.id_venta == Venta.id_venta)
        .join(Servicio, Servicio.id_servicio == DetalleVenta.id_servicio)
        .filter(
            Venta.estado == estado,
            Venta.fecha_venta >= datetime.combine(desde, datetime.min.time()),
            Venta.fecha_venta
            < datetime.combine(hasta + timedelta(days=1), datetime.min.time()),
        )
    )

    # Seguridad por rol: Admin y Empleado ven todo; el Cliente solo sus compras
    es_gestion = usuario_actual.rol.nombre in ("Administrador", "Empleado")
    if not es_gestion:
        consulta = consulta.filter(Venta.id_cliente == usuario_actual.id_usuario)

    # Filtros
    if cliente and cliente.strip() and es_gestion:
        patron = f"%{cliente.strip()}%"
        consulta = consulta.filter(
            Venta.cliente.has(
                or_(
                    (Usuario.nombre + " " + Usuario.apellido).ilike(patron),
                    Usuario.numero_documento.ilike(patron),
                )
            )
        )
    if servicio and servicio.strip():
        consulta = consulta.filter(Servicio.nombre.ilike(f"%{servicio.strip()}%"))

    filas = consulta.all()

    # Todos los periodos del rango, aunque no tengan ventas (así la línea es continua)
    acumulado = {}
    actual = _inicio_periodo(desde, agrupar)
    while actual <= hasta:
        acumulado[actual] = {"ventas": set(), "monto": 0.0}
        actual = _siguiente_periodo(actual, agrupar)

    por_servicio = defaultdict(lambda: {"unidades": 0, "monto": 0.0})
    ventas_totales = set()
    unidades_totales = 0
    monto_total = 0.0

    for id_venta, fecha_venta, nombre_servicio, cantidad, subtotal in filas:
        monto = float(subtotal)
        periodo = acumulado[_inicio_periodo(fecha_venta.date(), agrupar)]
        periodo["ventas"].add(id_venta)
        periodo["monto"] += monto
        por_servicio[nombre_servicio]["unidades"] += cantidad
        por_servicio[nombre_servicio]["monto"] += monto
        ventas_totales.add(id_venta)
        unidades_totales += cantidad
        monto_total += monto

    serie = [
        {
            "periodo": inicio.isoformat(),
            "etiqueta": _etiqueta_periodo(inicio, agrupar),
            "cantidad_ventas": len(datos["ventas"]),
            "monto": round(datos["monto"], 2),
        }
        for inicio, datos in acumulado.items()
    ]

    mas_vendidos = sorted(
        por_servicio.items(), key=lambda par: par[1]["unidades"], reverse=True
    )[:8]
    cantidad_ventas = len(ventas_totales)

    return {
        "agrupar": agrupar,
        "fecha_desde": desde,
        "fecha_hasta": hasta,
        "estado": estado,
        "indicadores": {
            "cantidad_ventas": cantidad_ventas,
            "monto_total": round(monto_total, 2),
            "unidades_vendidas": unidades_totales,
            "ticket_promedio": round(monto_total / cantidad_ventas, 2) if cantidad_ventas else 0.0,
        },
        "serie": serie,
        "por_servicio": [
            {"servicio": nombre, "unidades": datos["unidades"], "monto": round(datos["monto"], 2)}
            for nombre, datos in mas_vendidos
        ],
    }