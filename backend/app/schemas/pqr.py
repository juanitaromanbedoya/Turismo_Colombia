from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

TipoPQR = Literal["Petición", "Queja", "Reclamo"]
EstadoPQR = Literal["Pendiente", "En proceso", "Respondida", "Cerrada"]


class CrearPQR(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    tipo: TipoPQR
    asunto: str = Field(..., min_length=5, max_length=150)
    descripcion: str = Field(..., min_length=10, max_length=1000)


class GestionarPQR(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    estado: Optional[EstadoPQR] = None
    respuesta: Optional[str] = Field(None, max_length=1000)


class UsuarioPQR(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    correo: str

    class Config:
        from_attributes = True


class PQRRespuesta(BaseModel):
    id_pqr: int
    numero_pqr: str
    tipo: str
    asunto: str
    descripcion: str
    estado: str
    respuesta: Optional[str] = None
    fecha_creacion: datetime
    fecha_respuesta: Optional[datetime] = None
    cliente: UsuarioPQR
    respondido_por: Optional[UsuarioPQR] = None