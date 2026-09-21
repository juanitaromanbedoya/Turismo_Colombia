from datetime import date, datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.pqr import PQR
from app.models.usuario import Usuario
from app.schemas.pqr import CrearPQR, GestionarPQR, PQRRespuesta, EstadoPQR, TipoPQR
from app.core.dependencies import obtener_usuario_actual, requiere_rol

router = APIRouter(prefix="/api/pqr", tags=["PQR"])


def _serializar(p: PQR) -> dict:
    return {
        "id_pqr": p.id_pqr,
        "numero_pqr": p.numero_pqr,
        "tipo": p.tipo,
        "asunto": p.asunto,
        "descripcion": p.descripcion,
        "estado": p.estado,
        "respuesta": p.respuesta,
        "fecha_creacion": p.fecha_creacion,
        "fecha_respuesta": p.fecha_respuesta,
        "cliente": p.cliente,
        "respondido_por": p.respondido_por,
    }


def _con_usuarios(query):
    return query.options(joinedload(PQR.cliente), joinedload(PQR.respondido_por))


@router.post("/", response_model=PQRRespuesta, status_code=status.HTTP_201_CREATED)
def crear_pqr(
    datos: CrearPQR,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Cliente")),
):
    nueva = PQR(
        id_usuario=usuario_actual.id_usuario,
        tipo=datos.tipo,
        asunto=datos.asunto,
        descripcion=datos.descripcion,
        estado="Pendiente",
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return _serializar(nueva)


@router.get("/", response_model=List[PQRRespuesta])
def listar_pqr(
    estado: Optional[EstadoPQR] = None,
    tipo: Optional[TipoPQR] = None,
    cliente: Optional[str] = Query(None, max_length=100),
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    pagina: int = Query(1, ge=1),
    limite: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    if fecha_desde and fecha_hasta and fecha_desde > fecha_hasta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha inicial no puede ser mayor que la fecha final",
        )

    query = _con_usuarios(db.query(PQR))

    # Seguridad: Admin y Empleado ven todas; los demás solo las suyas
    es_gestion = usuario_actual.rol.nombre in ("Administrador", "Empleado")
    if not es_gestion:
        query = query.filter(PQR.id_usuario == usuario_actual.id_usuario)

    if estado:
        query = query.filter(PQR.estado == estado)
    if tipo:
        query = query.filter(PQR.tipo == tipo)
    if cliente and cliente.strip() and es_gestion:
        patron = f"%{cliente.strip()}%"
        query = query.filter(
            PQR.cliente.has(
                or_(
                    (Usuario.nombre + " " + Usuario.apellido).ilike(patron),
                    Usuario.numero_documento.ilike(patron),
                )
            )
        )
    if fecha_desde:
        query = query.filter(
            PQR.fecha_creacion >= datetime.combine(fecha_desde, datetime.min.time())
        )
    if fecha_hasta:
        query = query.filter(
            PQR.fecha_creacion
            < datetime.combine(fecha_hasta + timedelta(days=1), datetime.min.time())
        )

    resultados = (
        query.order_by(PQR.fecha_creacion.desc(), PQR.id_pqr.desc())
        .offset((pagina - 1) * limite)
        .limit(limite)
        .all()
    )
    return [_serializar(p) for p in resultados]


@router.get("/{id_pqr}", response_model=PQRRespuesta)
def obtener_pqr(
    id_pqr: int,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    pqr = _con_usuarios(db.query(PQR)).filter(PQR.id_pqr == id_pqr).first()

    if not pqr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQR no encontrada")

    es_gestion = usuario_actual.rol.nombre in ("Administrador", "Empleado")
    if not es_gestion and pqr.id_usuario != usuario_actual.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver esta PQR",
        )

    return _serializar(pqr)


@router.patch("/{id_pqr}", response_model=PQRRespuesta)
def gestionar_pqr(
    id_pqr: int,
    datos: GestionarPQR,
    db: Session = Depends(get_db),
    usuario_actual: Usuario = Depends(requiere_rol("Administrador", "Empleado")),
):
    pqr = _con_usuarios(db.query(PQR)).filter(PQR.id_pqr == id_pqr).first()

    if not pqr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PQR no encontrada")

    if pqr.estado == "Cerrada":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La PQR ya está cerrada y no se puede modificar",
        )

    respuesta = (datos.respuesta or "").strip()

    if not respuesta and datos.estado is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes indicar un estado o escribir una respuesta",
        )

    if respuesta:
        if datos.estado and datos.estado not in ("Respondida", "Cerrada"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Al responder, el estado debe ser Respondida o Cerrada",
            )
        pqr.respuesta = respuesta
        pqr.id_usuario_responde = usuario_actual.id_usuario
        pqr.fecha_respuesta = datetime.now()
        pqr.estado = datos.estado or "Respondida"
    else:
        if datos.estado == "Respondida" and not pqr.respuesta:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Para marcar como Respondida debes escribir una respuesta",
            )
        pqr.estado = datos.estado

    db.commit()
    db.refresh(pqr)
    return _serializar(pqr)