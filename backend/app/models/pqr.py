from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PQR(Base):
    __tablename__ = "pqr"

    id_pqr = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    tipo = Column(String(20), nullable=False)
    asunto = Column(String(150), nullable=False)
    descripcion = Column(String(1000), nullable=False)
    estado = Column(String(20), nullable=False, default="Pendiente")
    respuesta = Column(String(1000), nullable=True)
    id_usuario_responde = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    fecha_creacion = Column(DateTime, server_default=func.now())
    fecha_respuesta = Column(DateTime, nullable=True)

    # Dos FK hacia usuarios: hay que decir cuál usa cada relación
    cliente = relationship("Usuario", foreign_keys=[id_usuario])
    respondido_por = relationship("Usuario", foreign_keys=[id_usuario_responde])

    @property
    def numero_pqr(self):
        return f"PQR-{self.id_pqr:06d}"