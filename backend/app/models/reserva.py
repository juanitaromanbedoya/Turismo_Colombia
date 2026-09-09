from sqlalchemy import Column, Integer, DateTime, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Reserva(Base):
    __tablename__ = "reservas"

    id_reserva = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_servicio = Column(Integer, ForeignKey("servicios.id_servicio"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    fecha_reserva = Column(DateTime, server_default=func.now())
    estado = Column(Boolean, nullable=False, default=True)
    id_factura = Column(Integer, ForeignKey("facturas.id_factura"), nullable=True)
    precio_unitario = Column(Numeric(12, 2), nullable=True)

    usuario = relationship("Usuario")
    servicio = relationship("Servicio")
    factura = relationship("Factura", back_populates="reservas")