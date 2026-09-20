import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

// Fecha local en formato AAAA-MM-DD (toISOString usa UTC y después de las 7 p. m. daría "mañana")
const hoy = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};

const formatoFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
};

const formatoPesos = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));

const coloresEstado = {
  Completada: "bg-green-100 text-green-700",
  Pendiente: "bg-yellow-100 text-yellow-700",
  Anulada: "bg-red-100 text-red-700",
};

function ReporteDiario() {
  const [fecha, setFecha] = useState(hoy());
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!fecha) return;

    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const datos = await apiFetch(`/api/ventas/reporte-diario?fecha=${fecha}`);
        if (!cancelado) setReporte(datos);
      } catch (err) {
        if (!cancelado) {
          setError(err.message);
          setReporte(null);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [fecha]);

  const tarjetas = reporte
    ? [
        { titulo: "Total vendido", valor: formatoPesos(reporte.total_vendido), color: "text-[#087f8c]" },
        { titulo: "Ventas del día", valor: reporte.cantidad_ventas, color: "text-gray-700" },
        { titulo: "Completadas", valor: reporte.cantidad_completadas, color: "text-green-600" },
        { titulo: "Pendientes", valor: reporte.cantidad_pendientes, color: "text-yellow-600" },
        { titulo: "Anuladas", valor: reporte.cantidad_anuladas, color: "text-red-600" },
      ]
    : [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#087f8c]">Reporte diario de ventas</h2>
          <p className="text-sm text-gray-500">
            Consulta todas las ventas registradas en una fecha.
          </p>
        </div>

        <div>
          <label htmlFor="fecha-reporte" className="mb-1 block text-sm font-semibold text-gray-600">
            Fecha del reporte
          </label>
          <input
            id="fecha-reporte"
            type="date"
            value={fecha}
            max={hoy()}
            onChange={(e) => setFecha(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#087f8c]"
          />
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>
      )}

      {cargando && (
        <p className="py-8 text-center font-semibold text-[#087f8c]">Cargando reporte...</p>
      )}

      {!cargando && reporte && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {tarjetas.map((t) => (
              <div key={t.titulo} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-gray-500">{t.titulo}</p>
                <p className={`mt-1 text-2xl font-extrabold ${t.color}`}>{t.valor}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">N° venta</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Servicios (cantidad y valor)</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reporte.ventas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No hay ventas registradas el {formatoFecha(reporte.fecha)}.
                    </td>
                  </tr>
                ) : (
                  reporte.ventas.map((v) => (
                    <tr key={v.numero_venta} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 font-semibold text-[#087f8c]">{v.numero_venta}</td>
                      <td className="px-4 py-3">
                        {new Date(v.fecha_venta).toLocaleTimeString("es-CO", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">{v.cliente}</td>
                      <td className="px-4 py-3">
                        <ul className="space-y-1">
                          {v.items.map((item, i) => (
                            <li key={i}>
                              {item.servicio}{" "}
                              <span className="text-gray-500">
                                · x{item.cantidad} · {formatoPesos(item.subtotal)}
                              </span>
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

          <p className="mt-4 text-xs text-gray-500">
            Reporte del {formatoFecha(reporte.fecha)} generado por {reporte.generado_por} el{" "}
            {new Date(reporte.generado_en).toLocaleString("es-CO")}.
          </p>
        </>
      )}
    </div>
  );
}

export default ReporteDiario;