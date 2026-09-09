from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: dict  # contendrá id_usuario, nombre, apellido, correo, rol

class SolicitarRecuperacion(BaseModel):
    correo: EmailStr

class RestablecerPassword(BaseModel):
    token: str
    nueva_contrasena: str