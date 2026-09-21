from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Factura(Base):
    __tablename__ = "facturas"

    id_factura = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    fecha_emision = Column(DateTime, server_default=func.now())
    total = Column(Numeric(12, 2), nullable=False)
    estado = Column(String(20), nullable=False, default="Emitida")

    usuario = relationship("Usuario")
    reservas = relationship("Reserva", back_populates="factura")
    @property
    def numero_factura(self):
        return f"FAC-{self.id_factura:06d}"