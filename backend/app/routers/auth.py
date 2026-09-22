from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.models.rol import Rol
from app.schemas.auth import LoginRequest, TokenResponse, SolicitarRecuperacion, RestablecerPassword
from app.core.security import verify_password, crear_token, crear_token_recuperacion, verificar_token_recuperacion, hash_password
from app.core.email_utils import enviar_correo_recuperacion
from app.core.config import FRONTEND_URL

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post("/login", response_model=TokenResponse)
def login(datos: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
    if not verify_password(datos.contrasena, usuario.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )

    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo, contacte al administrador"
        )
    
    token = crear_token({
        "sub": str(usuario.id_usuario),
        "correo": usuario.correo,
        "rol": usuario.rol.nombre
    })

    return TokenResponse(
        access_token=token,
        usuario={
            "id_usuario": usuario.id_usuario,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            "correo": usuario.correo,
            "rol": usuario.rol.nombre
        }
    )

@router.post("/recuperar-password")
def solicitar_recuperacion(datos: SolicitarRecuperacion, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo).first()

    # Por seguridad, siempre respondemos lo mismo exista o no el correo
    # (así no revelamos qué correos están registrados)
    if usuario:
        token = crear_token_recuperacion(usuario.correo)
        enlace = f"{FRONTEND_URL}/restablecer-password?token={token}"
        try:
            enviar_correo_recuperacion(usuario.correo, enlace, usuario.nombre)
        except Exception as e:
            print(f"Error enviando correo: {e}")

    return {"mensaje": "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña."}


@router.post("/restablecer-password")
def restablecer_password(datos: RestablecerPassword, db: Session = Depends(get_db)):
    try:
        correo = verificar_token_recuperacion(datos.token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace de recuperación no es válido o ha expirado."
        )

    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if verify_password(datos.nueva_contrasena, usuario.contrasena):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes usar tu contraseña anterior. Elige una diferente."
        )

    usuario.contrasena = hash_password(datos.nueva_contrasena)
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente. Ya puedes iniciar sesión."}