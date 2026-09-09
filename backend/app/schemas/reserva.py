from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal


class ItemReserva(BaseModel):
    id_servicio: int
    cantidad: int = Field(..., gt=0, le=50)


class CrearReserva(BaseModel):
    items: List[ItemReserva] = Field(..., min_length=1)


class ServicioResumen(BaseModel):
    id_servicio: int
    nombre: str
    categoria: Optional[str]

    class Config:
        from_attributes = True


class ReservaRespuesta(BaseModel):
    id_reserva: int
    id_servicio: int
    servicio: ServicioResumen
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal
    fecha_reserva: datetime
    estado: bool

    class Config:
        from_attributes = True

    @staticmethod
    def calcular_subtotal(cantidad, precio_unitario):
        return cantidad * precio_unitario


class FacturaRespuesta(BaseModel):
    id_factura: int
    fecha_emision: datetime
    total: Decimal
    estado: str
    reservas: List[ReservaRespuesta]

    class Config:
        from_attributes = True