from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioRegistro, UsuarioRespuesta
from app.core.security import hash_password
from app.core.dependencies import obtener_usuario_actual, requiere_rol

router = APIRouter(prefix="/api/usuarios", tags=["Usuarios"])


@router.post("/registro", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    existente = db.query(Usuario).filter(
        or_(
            Usuario.correo == datos.correo,
            Usuario.numero_documento == datos.numero_documento
        )
    ).first()

    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario registrado con ese correo o número de documento"
        )

    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        tipo_documento=datos.tipo_documento,
        numero_documento=datos.numero_documento,
        direccion=datos.direccion,
        telefono=datos.telefono,
        correo=datos.correo,
        contrasena=hash_password(datos.contrasena),
        id_rol=3,
        estado=True
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


# Solo Administrador y Empleado pueden ver el listado completo de usuarios
@router.get("/", response_model=List[UsuarioRespuesta])
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado"))
):
    return db.query(Usuario).all()


# Cualquier usuario autenticado puede ver un usuario puntual (ajusta si quieres restringirlo más)
@router.get("/{id_usuario}", response_model=UsuarioRespuesta)
def obtener_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

from app.schemas.usuario import UsuarioRegistro, UsuarioRespuesta, UsuarioActualizar, CambiarEstado


# Actualizar datos propios o de otro usuario (Admin/Empleado pueden editar a cualquiera)
@router.put("/{id_usuario}", response_model=UsuarioRespuesta)
def actualizar_usuario(
    id_usuario: int,
    datos: UsuarioActualizar,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Un cliente solo puede editar su propio perfil
    if usuario_actual.rol.nombre == "Cliente" and usuario_actual.id_usuario != id_usuario:
        raise HTTPException(status_code=403, detail="No puedes editar otro usuario")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(usuario, campo, valor)

    db.commit()
    db.refresh(usuario)
    return usuario


# Cambiar estado activo/inactivo — solo Administrador
@router.patch("/{id_usuario}/estado", response_model=UsuarioRespuesta)
def cambiar_estado_usuario(
    id_usuario: int,
    datos: CambiarEstado,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador"))
):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.estado = datos.estado
    db.commit()
    db.refresh(usuario)
    return usuario


# "Eliminar" = desactivar (mantiene consistencia histórica) — solo Administrador
@router.delete("/{id_usuario}", status_code=status.HTTP_200_OK)
def eliminar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador"))
):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.estado = False
    db.commit()
    return {"mensaje": f"Usuario {usuario.correo} fue desactivado correctamente"}