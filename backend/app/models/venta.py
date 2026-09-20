from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Venta(Base):
    __tablename__ = "ventas"
    @property
    def numero_venta(self):
        return f"VTA-{self.id_venta:06d}"
    id_venta = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_usuario_registra = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=True)
    id_factura = Column(Integer, ForeignKey("facturas.id_factura"), nullable=True)
    subtotal = Column(Numeric(12, 2), nullable=False, default=0)
    descuento = Column(Numeric(12, 2), nullable=False, default=0)
    impuesto = Column(Numeric(12, 2), nullable=False, default=0)
    total = Column(Numeric(12, 2), nullable=False, default=0)
    estado = Column(String(20), nullable=False, default="Completada")
    fecha_venta = Column(DateTime, server_default=func.now())

    # Dos FK hacia usuarios: hay que decir cuál usa cada relación
    cliente = relationship("Usuario", foreign_keys=[id_cliente])
    registrado_por = relationship("Usuario", foreign_keys=[id_usuario_registra])
    factura = relationship("Factura")
    detalles = relationship("DetalleVenta", back_populates="venta")


class DetalleVenta(Base):
    __tablename__ = "detalle_ventas"

    id_detalle = Column(Integer, primary_key=True, index=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    id_servicio = Column(Integer, ForeignKey("servicios.id_servicio"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(12, 2), nullable=False)
    descuento = Column(Numeric(12, 2), nullable=False, default=0)
    subtotal = Column(Numeric(12, 2), nullable=False)

    venta = relationship("Venta", back_populates="detalles")
    servicio = relationship("Servicio")