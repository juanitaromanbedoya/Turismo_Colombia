from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class MensajeChat(BaseModel):
    rol: Literal["user", "model"]
    texto: str = Field(..., max_length=4000)


class SolicitudChat(BaseModel):
    mensaje: str = Field(..., min_length=1, max_length=500)
    historial: List[MensajeChat] = Field(default_factory=list, max_length=20)
    id_conversacion: Optional[int] = None


class RespuestaChat(BaseModel):
    respuesta: str
    id_conversacion: int