from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Permiso(Base):
    __tablename__ = "permisos"

    id_permiso = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(String(200), nullable=True)
    estado = Column(Boolean, nullable=False, default=True)

    roles = relationship("Rol", secondary="rol_permiso", back_populates="permisos")