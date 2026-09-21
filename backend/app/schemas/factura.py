from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class ClienteFactura(BaseModel):
    nombre_completo: str
    tipo_documento: str
    numero_documento: str
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo: str


class ItemFactura(BaseModel):
    servicio: str
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal


class FacturaVentaRespuesta(BaseModel):
    id_factura: int
    numero_factura: str
    numero_venta: Optional[str] = None
    fecha_emision: datetime
    cliente: ClienteFactura
    items: List[ItemFactura]
    subtotal: Decimal
    descuento: Decimal
    impuesto: Decimal
    total: Decimal
    estado: str

class FacturaResumen(BaseModel):
    id_factura: int
    numero_factura: str
    numero_venta: Optional[str] = None
    fecha_emision: datetime
    cliente: str
    numero_documento: str
    total: Decimal
    estado: str