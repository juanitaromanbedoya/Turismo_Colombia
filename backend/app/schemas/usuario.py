from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator, ConfigDict
from typing import Optional
from datetime import datetime
import re


class UsuarioRegistro(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=30)
    apellido: str = Field(..., min_length=2, max_length=30)
    tipo_documento: str = Field(..., min_length=2, max_length=10)
    numero_documento: str = Field(..., min_length=6, max_length=12)
    direccion: Optional[str] = Field(None, min_length=5, max_length=100)
    telefono: Optional[str] = Field(None, min_length=7, max_length=10)
    correo: EmailStr
    contrasena: str = Field(..., min_length=8, max_length=10)

    @field_validator("nombre", "apellido")
    @classmethod
    def validar_solo_letras(cls, v):
        if not re.match(r"^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$", v):
            raise ValueError("Solo se permiten letras")
        return v

    @field_validator("numero_documento")
    @classmethod
    def validar_documento_numerico(cls, v):
        if not v.isdigit():
            raise ValueError("El documento solo puede contener números")
        return v

    @field_validator("telefono")
    @classmethod
    def validar_telefono_numerico(cls, v):
        if v is not None and not v.isdigit():
            raise ValueError("El teléfono solo puede contener números")
        return v

    @field_validator("contrasena")
    @classmethod
    def validar_complejidad_contrasena(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Debe contener al menos una letra mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("Debe contener al menos una letra minúscula")
        if not re.search(r"\d", v):
            raise ValueError("Debe contener al menos un número")
        return v


class UsuarioRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_usuario: int
    nombre: str
    apellido: str
    tipo_documento: str
    numero_documento: str
    direccion: Optional[str]
    telefono: Optional[str]
    correo: EmailStr
    rol: str
    estado: bool
    fecha_registro: datetime

    @model_validator(mode="before")
    @classmethod
    def extraer_nombre_rol(cls, obj):
        datos = {columna.name: getattr(obj, columna.name) for columna in obj.__table__.columns}
        if getattr(obj, "rol", None) is not None:
            datos["rol"] = obj.rol.nombre
        return datos


class UsuarioActualizar(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=50)
    apellido: Optional[str] = Field(None, min_length=2, max_length=50)
    direccion: Optional[str] = Field(None, max_length=150)
    telefono: Optional[str] = Field(None, max_length=20)


class CambiarEstado(BaseModel):
    estado: bool