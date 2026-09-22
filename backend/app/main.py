from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models
from app.core.dependencies import obtener_usuario_actual
from app.routers import usuarios, auth, servicios, reservas, ventas, facturas, pqr, estadisticas

app = FastAPI(title="TurismoColombia API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://192.168.0.124:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios.router)
app.include_router(auth.router)
app.include_router(servicios.router)
app.include_router(reservas.router)
app.include_router(ventas.router)
app.include_router(facturas.router)
app.include_router(pqr.router)
app.include_router(estadisticas.router)

@app.get("/")
def read_root():
    return {"mensaje": "API de TurismoColombia funcionando correctamente 🚀"}

from app.core.dependencies import obtener_usuario_actual

@app.get("/api/perfil")
def ver_mi_perfil(usuario_actual = Depends(obtener_usuario_actual)):
    return {
        "id": usuario_actual.id_usuario,
        "nombre": usuario_actual.nombre,
        "correo": usuario_actual.correo,
        "rol": usuario_actual.rol.nombre
    }