from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
from app.database import get_db
from app.models.servicio import Servicio
from app.schemas.servicio import ServicioCrear, ServicioActualizar, ServicioRespuesta, CambiarEstadoServicio
from app.models.usuario import Usuario
from app.core.dependencies import obtener_usuario_actual, requiere_rol

router = APIRouter(prefix="/api/servicios", tags=["Servicios"])

# Pública: cualquiera puede ver los servicios activos, sin necesidad de login
@router.get("/publicos", response_model=List[ServicioRespuesta])
def listar_servicios_publicos(db: Session = Depends(get_db)):
    return db.query(Servicio).filter(Servicio.estado == True).all()

@router.get("/publicos/{id_servicio}", response_model=ServicioRespuesta)
def obtener_servicio_publico(id_servicio: int, db: Session = Depends(get_db)):
    servicio = db.query(Servicio).filter(
        Servicio.id_servicio == id_servicio,
        Servicio.estado == True
    ).first()

    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    return servicio

# Cualquier usuario autenticado puede ver los servicios
@router.get("/", response_model=List[ServicioRespuesta])
def listar_servicios(
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    return db.query(Servicio).all()


@router.get("/{id_servicio}", response_model=ServicioRespuesta)
def obtener_servicio(
    id_servicio: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    return servicio


# Solo Administrador y Empleado pueden crear servicios
@router.post("/", response_model=ServicioRespuesta, status_code=status.HTTP_201_CREATED)
def crear_servicio(
    datos: ServicioCrear,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado"))
):
    nuevo_servicio = Servicio(
        **datos.model_dump(),
        estado=True,
        fecha_creacion=func.now()
    )
    db.add(nuevo_servicio)
    db.commit()
    db.refresh(nuevo_servicio)
    return nuevo_servicio


# Solo Administrador y Empleado pueden editar
@router.put("/{id_servicio}", response_model=ServicioRespuesta)
def actualizar_servicio(
    id_servicio: int,
    datos: ServicioActualizar,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado"))
):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(servicio, campo, valor)

    db.commit()
    db.refresh(servicio)
    return servicio


@router.patch("/{id_servicio}/estado", response_model=ServicioRespuesta)
def cambiar_estado_servicio(
    id_servicio: int,
    datos: CambiarEstadoServicio,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado"))
):
    servicio = db.query(Servicio).filter(Servicio.id_servicio == id_servicio).first()
    if not servicio:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    servicio.estado = datos.estado
    db.commit()
    db.refresh(servicio)
    return servicio