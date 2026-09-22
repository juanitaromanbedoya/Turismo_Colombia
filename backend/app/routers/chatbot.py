import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.chat import Conversacion, Mensaje
from app.models.servicio import Servicio
from app.models.usuario import Usuario
from app.schemas.chatbot import SolicitudChat, RespuestaChat
from app.core.dependencies import obtener_usuario_opcional

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])

MODELO = "gemini-3.6-flash"


def _catalogo_servicios(db: Session) -> str:
    servicios = db.query(Servicio).filter(Servicio.estado == True).all()
    if not servicios:
        return "Por el momento no hay servicios activos publicados."

    lineas = []
    for s in servicios:
        precio = f"${float(s.precio):,.0f}".replace(",", ".")
        detalle = f"- {s.nombre} ({s.categoria or 'General'}): {precio}"
        if s.duracion:
            detalle += f", duración {s.duracion}"
        if s.ubicacion:
            detalle += f", en {s.ubicacion}"
        lineas.append(detalle)
    return "\n".join(lineas)


def _instrucciones(db: Session) -> str:
    return f"""Eres el asistente virtual de Turismo Colombia, un sitio web de venta de servicios turísticos.

Catálogo de servicios activos (es la única información real sobre servicios que puedes usar; nunca inventes servicios, precios ni ubicaciones que no estén aquí):
{_catalogo_servicios(db)}

Tu trabajo:
1. Responder preguntas frecuentes sobre el sitio (cómo funciona, medios de pago, cómo registrarse).
2. Orientar sobre los servicios del catálogo: qué incluyen, precio, duración, ubicación, y ayudar a decidir según lo que busque la persona.
3. Explicar el proceso de compra: el cliente inicia sesión, agrega los servicios que quiere, confirma la reserva y el sistema genera automáticamente la factura y el registro de la venta; después puede consultarla en "Mis facturas" o "Mis reservas".
4. Orientar sobre PQR (peticiones, quejas y reclamos): explica que puede registrar una solicitud desde la sección "Mis PQR" de su panel, eligiendo el tipo (Petición, Queja o Reclamo), y que allí mismo puede ver el estado y la respuesta.

Reglas:
- Responde siempre en español, de forma breve, clara y amable (máximo unos 3 párrafos cortos).
- Si te preguntan algo que no tiene relación con Turismo Colombia, indica amablemente que solo puedes ayudar con temas del sitio.
- Si detectas una queja o reclamo grave, sugiere registrarlo como PQR para que quede con seguimiento formal.
- No inventes información que no esté aquí ni prometas descuentos o políticas que no se han mencionado."""


def _obtener_o_crear_conversacion(
    db: Session, id_conversacion: Optional[int], usuario_actual: Optional[Usuario]
) -> Conversacion:
    if id_conversacion:
        conversacion = (
            db.query(Conversacion)
            .filter(Conversacion.id_conversacion == id_conversacion)
            .first()
        )
        if conversacion:
            # Una conversación de un usuario logueado solo la puede continuar ese mismo usuario
            if conversacion.id_usuario is not None:
                if not usuario_actual or conversacion.id_usuario != usuario_actual.id_usuario:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="No tienes permiso para continuar esta conversación",
                    )
            return conversacion

    nueva = Conversacion(id_usuario=usuario_actual.id_usuario if usuario_actual else None)
    db.add(nueva)
    db.flush()  # para obtener id_conversacion
    return nueva


@router.post("/mensaje", response_model=RespuestaChat)
def enviar_mensaje(
    datos: SolicitudChat,
    db: Session = Depends(get_db),
    usuario_actual: Optional[Usuario] = Depends(obtener_usuario_opcional),
):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El chatbot no está configurado en el servidor",
        )

    conversacion = _obtener_o_crear_conversacion(db, datos.id_conversacion, usuario_actual)

    client = genai.Client(api_key=api_key)

    contenidos = [
        types.Content(role=m.rol, parts=[types.Part(text=m.texto)])
        for m in datos.historial
    ]
    contenidos.append(types.Content(role="user", parts=[types.Part(text=datos.mensaje)]))

    try:
        respuesta = client.models.generate_content(
            model=MODELO,
            contents=contenidos,
            config=types.GenerateContentConfig(
                system_instruction=_instrucciones(db),
                max_output_tokens=1024,
            ),
        )
    except Exception as e:
        print(f"ERROR CHATBOT: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="El chatbot no está disponible en este momento, intenta de nuevo en unos segundos",
        )

    texto = (respuesta.text or "").strip()
    if not texto:
        texto = "No tengo una respuesta clara para eso. ¿Puedes reformular tu pregunta?"

    db.add(Mensaje(id_conversacion=conversacion.id_conversacion, rol="user", texto=datos.mensaje))
    db.add(Mensaje(id_conversacion=conversacion.id_conversacion, rol="model", texto=texto))
    conversacion.ultima_actividad = datetime.now()
    db.commit()

    return {"respuesta": texto, "id_conversacion": conversacion.id_conversacion}