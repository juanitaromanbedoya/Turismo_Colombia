from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal


class ClienteResumen(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    numero_documento: str

    class Config:
        from_attributes = True


class ServicioVentaResumen(BaseModel):
    id_servicio: int
    nombre: str
    categoria: Optional[str] = None

    class Config:
        from_attributes = True


class DetalleVentaRespuesta(BaseModel):
    id_detalle: int
    servicio: ServicioVentaResumen
    cantidad: int
    precio_unitario: Decimal
    descuento: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class VentaRespuesta(BaseModel):
    id_venta: int
    numero_venta: str
    cliente: ClienteResumen
    id_factura: Optional[int] = None
    subtotal: Decimal
    descuento: Decimal
    impuesto: Decimal
    total: Decimal
    estado: str
    fecha_venta: datetime
    detalles: List[DetalleVentaRespuesta]

    class Config:
        from_attributes = True

class ItemReporte(BaseModel):
    servicio: str
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal


class VentaReporte(BaseModel):
    numero_venta: str
    fecha_venta: datetime
    cliente: str
    items: List[ItemReporte]
    total: Decimal
    estado: str


class ReporteDiario(BaseModel):
    fecha: date
    ventas: List[VentaReporte]
    cantidad_ventas: int
    cantidad_completadas: int
    cantidad_pendientes: int
    cantidad_anuladas: int
    total_vendido: Decimal
    generado_por: str
    generado_en: datetime