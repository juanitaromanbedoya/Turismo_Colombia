from typing import List, Literal, Optional
from datetime import date

from pydantic import BaseModel


class ItemLista(BaseModel):
    titulo: str
    subtitulo: Optional[str] = None
    valor: Optional[str] = None
    estado: Optional[str] = None


class Tarjeta(BaseModel):
    clave: str
    titulo: str
    valor: float
    formato: Literal["numero", "moneda"]
    detalle: Optional[str] = None
    porcentaje: Optional[float] = None
    etiqueta_porcentaje: Optional[str] = None
    lista_titulo: Optional[str] = None
    lista: List[ItemLista] = []


class ResumenRespuesta(BaseModel):
    rol: str
    tarjetas: List[Tarjeta]

class PuntoSerie(BaseModel):
    periodo: str
    etiqueta: str
    cantidad_ventas: int
    monto: float


class ServicioVendido(BaseModel):
    servicio: str
    unidades: int
    monto: float


class IndicadoresVentas(BaseModel):
    cantidad_ventas: int
    monto_total: float
    unidades_vendidas: int
    ticket_promedio: float


class EstadisticasVentas(BaseModel):
    agrupar: str
    fecha_desde: date
    fecha_hasta: date
    estado: str
    indicadores: IndicadoresVentas
    serie: List[PuntoSerie]
    por_servicio: List[ServicioVendido]