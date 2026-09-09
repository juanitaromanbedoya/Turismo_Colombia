from sqlalchemy import Column, Integer, String, Boolean, DateTime, Numeric
from app.database import Base

class Servicio(Base):
    __tablename__ = "servicios"

    id_servicio = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(String(500), nullable=True)
    descripcion_detallada = Column(String(1000), nullable=True)
    precio = Column(Numeric(12, 2), nullable=False)
    imagen = Column(String(255), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)
    fecha_creacion = Column(DateTime, nullable=False)
    categoria = Column(String(50), nullable=True)
    duracion = Column(String(50), nullable=True)
    ubicacion = Column(String(100), nullable=True)
    cupo_maximo = Column(Integer, nullable=True)
    incluye_transporte = Column(Boolean, nullable=False, default=False)
    incluye_alimentacion = Column(Boolean, nullable=False, default=False)
    detalle_incluye = Column(String(300), nullable=True)