from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ServicioCrear(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    descripcion_detallada: Optional[str] = Field(None, max_length=1000)
    precio: Decimal = Field(..., gt=0)
    imagen: Optional[str] = Field(None, max_length=255)
    categoria: Optional[str] = Field(None, max_length=50)
    duracion: Optional[str] = Field(None, max_length=50)
    ubicacion: Optional[str] = Field(None, max_length=100)
    cupo_maximo: Optional[int] = Field(None, gt=0)
    incluye_transporte: Optional[bool] = False
    incluye_alimentacion: Optional[bool] = False
    detalle_incluye: Optional[str] = Field(None, max_length=300)


class ServicioActualizar(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    descripcion: Optional[str] = Field(None, max_length=500)
    descripcion_detallada: Optional[str] = Field(None, max_length=1000)
    precio: Optional[Decimal] = Field(None, gt=0)
    imagen: Optional[str] = Field(None, max_length=255)
    categoria: Optional[str] = Field(None, max_length=50)
    duracion: Optional[str] = Field(None, max_length=50)
    ubicacion: Optional[str] = Field(None, max_length=100)
    cupo_maximo: Optional[int] = Field(None, gt=0)
    incluye_transporte: Optional[bool] = None
    incluye_alimentacion: Optional[bool] = None
    detalle_incluye: Optional[str] = Field(None, max_length=300)
    estado: Optional[bool] = None


class ServicioRespuesta(BaseModel):
    id_servicio: int
    nombre: str
    descripcion: Optional[str]
    descripcion_detallada: Optional[str]
    precio: Decimal
    imagen: Optional[str]
    estado: bool
    fecha_creacion: datetime
    categoria: Optional[str]
    duracion: Optional[str]
    ubicacion: Optional[str]
    cupo_maximo: Optional[int]
    incluye_transporte: bool
    incluye_alimentacion: bool
    detalle_incluye: Optional[str]

    class Config:
        from_attributes = True


class CambiarEstadoServicio(BaseModel):
    estado: bool