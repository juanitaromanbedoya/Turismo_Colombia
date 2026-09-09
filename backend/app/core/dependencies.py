from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.core.security import verificar_token

security_scheme = HTTPBearer()

def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    token = credenciales.credentials
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la credencial",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verificar_token(token)
        id_usuario = payload.get("sub")
        if id_usuario is None:
            raise credenciales_invalidas
    except JWTError:
        raise credenciales_invalidas

    usuario = db.query(Usuario).filter(Usuario.id_usuario == int(id_usuario)).first()
    if usuario is None:
        raise credenciales_invalidas

    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    return usuario

def requiere_rol(*roles_permitidos: str):

    def verificador(usuario_actual: Usuario = Depends(obtener_usuario_actual)) -> Usuario:
        if usuario_actual.rol.nombre not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permisos para realizar esta acción. Rol requerido: {', '.join(roles_permitidos)}"
            )
        return usuario_actual
    
    return verificador