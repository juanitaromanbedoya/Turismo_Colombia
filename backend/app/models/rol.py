from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Rol(Base):
    __tablename__ = "roles"

    id_rol = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(200), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    usuarios = relationship("Usuario", back_populates="rol")
    permisos = relationship("Permiso", secondary="rol_permiso", back_populates="roles")