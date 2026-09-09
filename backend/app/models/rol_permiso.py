from sqlalchemy import Column, Integer, ForeignKey, Table
from app.database import Base

rol_permiso = Table(
    "rol_permiso",
    Base.metadata,
    Column("id_rol", Integer, ForeignKey("roles.id_rol"), primary_key=True),
    Column("id_permiso", Integer, ForeignKey("permisos.id_permiso"), primary_key=True),
)