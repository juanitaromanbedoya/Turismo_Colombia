from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Conversacion(Base):
    __tablename__ = "conversaciones"

    id_conversacion = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_inicio = Column(DateTime, server_default=func.now())
    ultima_actividad = Column(DateTime, server_default=func.now())

    usuario = relationship("Usuario")
    mensajes = relationship(
        "Mensaje", back_populates="conversacion", order_by="Mensaje.id_mensaje"
    )


class Mensaje(Base):
    __tablename__ = "mensajes"

    id_mensaje = Column(Integer, primary_key=True, index=True)
    id_conversacion = Column(Integer, ForeignKey("conversaciones.id_conversacion"), nullable=False)
    rol = Column(String(10), nullable=False)
    texto = Column(String(4000), nullable=False)
    fecha_envio = Column(DateTime, server_default=func.now())

    conversacion = relationship("Conversacion", back_populates="mensajes")