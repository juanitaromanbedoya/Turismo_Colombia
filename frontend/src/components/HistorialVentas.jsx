import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

const LIMITE = 10;

const FILTROS_VACIOS = {
  fecha_desde: "",
  fecha_hasta: "",
  cliente: "",
  servicio: "",
  estado: "",
  valor_min: "",
  valor_max: "",
};

const CAMPOS = [
  { name: "fecha_desde", label: "Desde", type: "date" },
  { name: "fecha_hasta", label: "Hasta", type: "date" },
  { name: "cliente", label: "Cliente", type: "text", placeholder: "Nombre o documento" },
  { name: "servicio", label: "Servicio", type: "text", placeholder: "Nombre del servicio" },
  { name: "estado", label: "Estado", type: "select" },
  { name: "valor_min", label: "Valor mínimo", type: "number", placeholder: "0" },
  { name: "valor_max", label: "Valor máximo", type: "number", placeholder: "0" },
];

const coloresEstado = {
  Completada: "bg-green-100 text-green-700",
  Pendiente: "bg-yellow-100 text-yellow-700",
  Anulada: "bg-red-100 text-red-700",
};

const estiloInput =
  "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#087f8c]";

const formatoPesos = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));

function HistorialVentas() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);       // lo que se escribe
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS);   // lo que se consulta
  const [pagina, setPagina] = useState(1);
  const [ventas, setVentas] = useState([]);
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
          const limpio = valor.trim();
          if (limpio) params.append(clave, limpio);
        });
        params.append("pagina", pagina);
        params.append("limite", LIMITE);

        const datos = await apiFetch(`/api/ventas/?${params.toString()}`);
        if (!cancelado) setVentas(datos);
      } catch (err) {
        if (!cancelado) {
          setError(err.message);
          setVentas([]);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [aplicados, pagina]);

  const cambiarFiltro = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const buscar = (e) => {
    e.preventDefault();

    if (filtros.fecha_desde && filtros.fecha_hasta && filtros.fecha_desde > filtros.fecha_hasta) {
      setErrorFiltros("La fecha inicial no puede ser mayor que la fecha final.");
      return;
    }
    if (Number(filtros.valor_min) < 0 || Number(filtros.valor_max) < 0) {
      setErrorFiltros("Los valores no pueden ser negativos.");
      return;
    }
    if (
      filtros.valor_min !== "" &&
      filtros.valor_max !== "" &&
      Number(filtros.valor_min) > Number(filtros.valor_max)
    ) {
      setErrorFiltros("El valor mínimo no puede ser mayor que el valor máximo.");
      return;
    }

    setErrorFiltros("");
    setPagina(1);
    setAplicados({ ...filtros });
  };

  const limpiar = () => {
    setErrorFiltros("");
    setFiltros(FILTROS_VACIOS);
    setAplicados(FILTROS_VACIOS);
    setPagina(1);
  };

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-[#087f8c]">Historial de ventas</h2>
      <p className="mb-6 text-sm text-gray-500">
        Consulta las ventas registradas y filtra por fecha, cliente, servicio, estado o valor.
      </p>

      <form onSubmit={buscar} className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPOS.map((c) => (
            <div key={c.name}>
              <label htmlFor={c.name} className="mb-1 block text-sm font-semibold text-gray-600">
                {c.label}
              </label>
              {c.type === "select" ? (
                <select
                  id={c.name}
                  name={c.name}
                  value={filtros[c.name]}
                  onChange={cambiarFiltro}
                  className={estiloInput}
                >
                  <option value="">Todos</option>
                  <option value="Completada">Completada</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Anulada">Anulada</option>
                </select>
              ) : (
                <input
                  id={c.name}
                  name={c.name}
                  type={c.type}
                  value={filtros[c.name]}
                  onChange={cambiarFiltro}
                  placeholder={c.placeholder}
                  min={c.type === "number" ? 0 : undefined}
                  className={estiloInput}
                />
              )}
            </div>
          ))}
        </div>

        {errorFiltros && (
          <p className="mt-3 text-sm font-semibold text-red-500">{errorFiltros}</p>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[#087f8c] px-5 py-2 font-semibold text-white hover:opacity-90"
          >
            Buscar
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

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">N° venta</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Servicios</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Cargando ventas...
                </td>
              </tr>
            ) : ventas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay ventas para mostrar.
                </td>
              </tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id_venta} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 font-semibold text-[#087f8c]">{v.numero_venta}</td>
                  <td className="px-4 py-3">{new Date(v.fecha_venta).toLocaleString("es-CO")}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-700">
                      {v.cliente.nombre} {v.cliente.apellido}
                    </p>
                    <p className="text-xs text-gray-500">{v.cliente.numero_documento}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-1">
                      {v.detalles.map((d) => (
                        <li key={d.id_detalle}>
                          {d.servicio.nombre} <span className="text-gray-500">x{d.cantidad}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatoPesos(v.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        coloresEstado[v.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {v.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPagina(pagina - 1)}
          disabled={pagina === 1 || cargando}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          ← Anterior
        </button>
        <span className="text-sm text-gray-500">Página {pagina}</span>
        <button
          onClick={() => setPagina(pagina + 1)}
          disabled={ventas.length < LIMITE || cargando}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

export default HistorialVentas;