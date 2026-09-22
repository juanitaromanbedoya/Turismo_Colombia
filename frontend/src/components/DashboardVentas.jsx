import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { apiFetch } from "../services/api";

const AGRUPACIONES = [
  { valor: "dia", etiqueta: "Por día" },
  { valor: "semana", etiqueta: "Por semana" },
  { valor: "mes", etiqueta: "Por mes" },
];
const ESTADOS = ["Completada", "Pendiente", "Anulada"];

const estiloInput =
  "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#087f8c]";

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const haceDias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const formatoPesos = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));

const formatoPesosCorto = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(valor));

const FILTROS_INICIALES = {
  agrupar: "dia",
  fecha_desde: haceDias(29),
  fecha_hasta: hoy(),
  servicio: "",
  cliente: "",
  estado: "Completada",
};

function TarjetaMini({ titulo, valor }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{titulo}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#087f8c]">{valor}</p>
    </div>
  );
}

function TooltipLinea({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const punto = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className="text-[#087f8c]">{formatoPesos(punto.monto)}</p>
      <p className="text-gray-500">{punto.cantidad_ventas} venta(s)</p>
    </div>
  );
}

function TooltipBarra({ active, payload }) {
  if (!active || !payload?.length) return null;
  const punto = payload[0].payload;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm shadow-lg">
      <p className="font-semibold text-gray-700">{punto.servicio}</p>
      <p className="text-[#087f8c]">{punto.unidades} unidades</p>
      <p className="text-gray-500">{formatoPesos(punto.monto)}</p>
    </div>
  );
}

function DashboardVentas() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);   // lo que se escribe
  const [aplicados, setAplicados] = useState(FILTROS_INICIALES); // lo que se consulta
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [errorFiltros, setErrorFiltros] = useState("");

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const params = new URLSearchParams();
        Object.entries(aplicados).forEach(([clave, valor]) => {
          if (valor && valor.toString().trim()) params.append(clave, valor);
        });

        const respuesta = await apiFetch(`/api/estadisticas/ventas?${params.toString()}`);
        if (!cancelado) setDatos(respuesta);
      } catch (err) {
        if (!cancelado) {
          setError(err.message);
          setDatos(null);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [aplicados]);

  const cambiarFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const buscar = (e) => {
    e.preventDefault();
    if (filtros.fecha_desde && filtros.fecha_hasta && filtros.fecha_desde > filtros.fecha_hasta) {
      setErrorFiltros("La fecha inicial no puede ser mayor que la fecha final.");
      return;
    }
    setErrorFiltros("");
    setAplicados({ ...filtros });
  };

  const limpiar = () => {
    setErrorFiltros("");
    setFiltros(FILTROS_INICIALES);
    setAplicados(FILTROS_INICIALES);
  };

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-[#087f8c]">Dashboard de ventas</h2>
      <p className="mb-6 text-sm text-gray-500">
        Analiza el comportamiento de las ventas por día, semana o mes.
      </p>

      {/* ---------- Filtros ---------- */}
      <form onSubmit={buscar} className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label htmlFor="dv-agrupar" className="mb-1 block text-sm font-semibold text-gray-600">
              Agrupar
            </label>
            <select
              id="dv-agrupar"
              name="agrupar"
              value={filtros.agrupar}
              onChange={cambiarFiltro}
              className={estiloInput}
            >
              {AGRUPACIONES.map((a) => (
                <option key={a.valor} value={a.valor}>
                  {a.etiqueta}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dv-desde" className="mb-1 block text-sm font-semibold text-gray-600">
              Desde
            </label>
            <input
              id="dv-desde"
              name="fecha_desde"
              type="date"
              value={filtros.fecha_desde}
              max={hoy()}
              onChange={cambiarFiltro}
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="dv-hasta" className="mb-1 block text-sm font-semibold text-gray-600">
              Hasta
            </label>
            <input
              id="dv-hasta"
              name="fecha_hasta"
              type="date"
              value={filtros.fecha_hasta}
              max={hoy()}
              onChange={cambiarFiltro}
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="dv-servicio" className="mb-1 block text-sm font-semibold text-gray-600">
              Servicio
            </label>
            <input
              id="dv-servicio"
              name="servicio"
              type="text"
              value={filtros.servicio}
              onChange={cambiarFiltro}
              placeholder="Nombre del servicio"
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="dv-cliente" className="mb-1 block text-sm font-semibold text-gray-600">
              Cliente
            </label>
            <input
              id="dv-cliente"
              name="cliente"
              type="text"
              value={filtros.cliente}
              onChange={cambiarFiltro}
              placeholder="Nombre o documento"
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="dv-estado" className="mb-1 block text-sm font-semibold text-gray-600">
              Estado
            </label>
            <select
              id="dv-estado"
              name="estado"
              value={filtros.estado}
              onChange={cambiarFiltro}
              className={estiloInput}
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorFiltros && (
          <p className="mt-3 text-sm font-semibold text-red-500">{errorFiltros}</p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[#087f8c] px-5 py-2 font-semibold text-white hover:opacity-90"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={limpiar}
            className="rounded-xl border border-gray-200 px-5 py-2 font-semibold text-gray-600 hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </form>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>
      )}

      {cargando && (
        <p className="py-8 text-center font-semibold text-[#087f8c]">Cargando estadísticas...</p>
      )}

      {!cargando && datos && (
        <>
          {/* ---------- Cards ---------- */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <TarjetaMini titulo="Ventas" valor={datos.indicadores.cantidad_ventas} />
            <TarjetaMini titulo="Monto total" valor={formatoPesos(datos.indicadores.monto_total)} />
            <TarjetaMini titulo="Unidades vendidas" valor={datos.indicadores.unidades_vendidas} />
            <TarjetaMini
              titulo="Ticket promedio"
              valor={formatoPesos(datos.indicadores.ticket_promedio)}
            />
          </div>

          {/* ---------- Gráfico lineal ---------- */}
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-700">
              Ventas {AGRUPACIONES.find((a) => a.valor === datos.agrupar)?.etiqueta.toLowerCase()}
            </h3>
            {datos.serie.every((p) => p.monto === 0) ? (
              <p className="py-10 text-center text-sm text-gray-500">
                No hay ventas en estado "{datos.estado}" para este rango.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datos.serie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="etiqueta" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatoPesosCorto} tick={{ fontSize: 12 }} width={70} />
                  <Tooltip content={<TooltipLinea />} />
                  <Line
                    type="monotone"
                    dataKey="monto"
                    stroke="#087f8c"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ---------- Gráfico de barras ---------- */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-700">Servicios más vendidos</h3>
            {datos.por_servicio.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                No hay servicios vendidos en este filtro.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={datos.por_servicio} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="servicio"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<TooltipBarra />} />
                  <Bar dataKey="unidades" fill="#f4b942" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardVentas;