from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    tipo_documento = Column(String(10), nullable=False)
    numero_documento = Column(String(20), nullable=False, unique=True)
    direccion = Column(String(150))
    telefono = Column(String(20))
    correo = Column(String(100), nullable=False, unique=True)
    contrasena = Column(String(255), nullable=False)  # SOLO se guarda el hash
    id_rol = Column(Integer, ForeignKey("roles.id_rol"), nullable=False)
    estado = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())

    rol = relationship("Rol", back_populates="usuarios")