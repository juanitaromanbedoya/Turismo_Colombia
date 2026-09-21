import { useEffect, useState } from "react";
import { apiFetch, apiDescargar } from "../services/api";

const LIMITE = 10;

const FILTROS_VACIOS = { numero: "", cliente: "", fecha_desde: "", fecha_hasta: "" };

const CAMPOS = [
  { name: "numero", label: "N° de factura", type: "text", placeholder: "Ej: FAC-000012 o 12" },
  { name: "cliente", label: "Cliente", type: "text", placeholder: "Nombre o documento" },
  { name: "fecha_desde", label: "Desde", type: "date" },
  { name: "fecha_hasta", label: "Hasta", type: "date" },
];

const coloresEstado = {
  Emitida: "bg-green-100 text-green-700",
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

function ConsultaFacturas({ esCliente = false }) {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);       // lo que se escribe
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS);   // lo que se consulta
  const [pagina, setPagina] = useState(1);
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [errorFiltros, setErrorFiltros] = useState("");

  // Detalle de una factura (ventana emergente)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState("");

const campos = esCliente ? CAMPOS.filter((c) => c.name !== "cliente") : CAMPOS;

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

        const datos = await apiFetch(`/api/facturas/?${params.toString()}`);
        if (!cancelado) setFacturas(datos);
      } catch (err) {
        if (!cancelado) {
          setError(err.message);
          setFacturas([]);
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
    if (filtros.numero.trim() && !/\d/.test(filtros.numero)) {
      setErrorFiltros("El número de factura debe tener dígitos, por ejemplo FAC-000012 o 12.");
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

    const verDetalle = async (idFactura) => {
    setErrorDescarga("");
    setModalAbierto(true);
    setDetalle(null);
    setErrorDetalle("");
    setCargandoDetalle(true);
    try {
      const datos = await apiFetch(`/api/facturas/${idFactura}`);
      setDetalle(datos);
    } catch (err) {
      setErrorDetalle(err.message);
    } finally {
      setCargandoDetalle(false);
    }
  };
    const descargarPdf = async () => {
    if (!detalle) return;
    setDescargando(true);
    setErrorDescarga("");
    try {
      await apiDescargar(
        `/api/facturas/${detalle.id_factura}/pdf`,
        `${detalle.numero_factura}.pdf`
      );
    } catch (err) {
      setErrorDescarga(err.message);
    } finally {
      setDescargando(false);
    }
  };

   const cerrarDetalle = () => {
    setModalAbierto(false);
    setDetalle(null);
    setErrorDetalle("");
    setErrorDescarga("");
  };

  return (
    <div>
            <h2 className="mb-1 text-2xl font-bold text-[#087f8c]">
        {esCliente ? "Mis facturas" : "Consulta de facturas"}
      </h2>
      <p className="mb-6 text-sm text-gray-500">
        {esCliente
          ? "Busca tus facturas por número o fecha, ábrelas y descárgalas en PDF."
          : "Busca facturas por número, cliente o fecha y abre el detalle de cada una."}
      </p>

      {/* ---------- Filtros ---------- */}
      <form onSubmit={buscar} className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className={`grid gap-4 sm:grid-cols-2 ${esCliente ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {campos.map((c) => (
            <div key={c.name}>
              <label htmlFor={`fac-${c.name}`} className="mb-1 block text-sm font-semibold text-gray-600">
                {c.label}
              </label>
              <input
                id={`fac-${c.name}`}
                name={c.name}
                type={c.type}
                value={filtros[c.name]}
                onChange={cambiarFiltro}
                placeholder={c.placeholder}
                className={estiloInput}
              />
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

      {/* ---------- Tabla ---------- */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">N° factura</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Cargando facturas...
                </td>
              </tr>
            ) : facturas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No hay facturas para mostrar.
                </td>
              </tr>
            ) : (
              facturas.map((f) => (
                <tr key={f.id_factura} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 font-semibold text-[#087f8c]">{f.numero_factura}</td>
                  <td className="px-4 py-3">
                    {new Date(f.fecha_emision).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-700">{f.cliente}</p>
                    <p className="text-xs text-gray-500">{f.numero_documento}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatoPesos(f.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        coloresEstado[f.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {f.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => verDetalle(f.id_factura)}
                      className="rounded-lg bg-[#087f8c] px-3 py-2 text-xs font-bold text-white hover:bg-[#006b75]"
                    >
                      Ver factura
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Paginación ---------- */}
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
          disabled={facturas.length < LIMITE || cargando}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>

      {/* ---------- Ventana con el detalle de la factura ---------- */}
      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={cerrarDetalle}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {cargandoDetalle && (
              <p className="py-10 text-center font-semibold text-[#087f8c]">Cargando factura...</p>
            )}

            {errorDetalle && (
              <>
                <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                  {errorDetalle}
                </p>
                <button
                  onClick={cerrarDetalle}
                  className="mt-4 rounded-xl border border-gray-200 px-5 py-2 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </>
            )}

            {detalle && (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500">
                      Turismo Colombia
                    </p>
                    <h3 className="text-2xl font-extrabold text-[#087f8c]">
                      Factura {detalle.numero_factura}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(detalle.fecha_emision).toLocaleString("es-CO")}
                      {detalle.numero_venta && <> · Venta {detalle.numero_venta}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        coloresEstado[detalle.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {detalle.estado}
                    </span>
                    <button
                      onClick={cerrarDetalle}
                      aria-label="Cerrar"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="mb-4 rounded-xl bg-gray-50 p-4 text-sm">
                  <p className="mb-1 font-bold text-gray-700">Datos del cliente</p>
                  <p>{detalle.cliente.nombre_completo}</p>
                  <p className="text-gray-600">
                    {detalle.cliente.tipo_documento} {detalle.cliente.numero_documento}
                  </p>
                  <p className="text-gray-600">{detalle.cliente.correo}</p>
                  {detalle.cliente.telefono && (
                    <p className="text-gray-600">Tel: {detalle.cliente.telefono}</p>
                  )}
                  {detalle.cliente.direccion && (
                    <p className="text-gray-600">{detalle.cliente.direccion}</p>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-3 py-2">Servicio</th>
                        <th className="px-3 py-2 text-center">Cant.</th>
                        <th className="px-3 py-2 text-right">Precio unit.</th>
                        <th className="px-3 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalle.items.map((item, i) => (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="px-3 py-2">{item.servicio}</td>
                          <td className="px-3 py-2 text-center">{item.cantidad}</td>
                          <td className="px-3 py-2 text-right">{formatoPesos(item.precio_unitario)}</td>
                          <td className="px-3 py-2 text-right">{formatoPesos(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatoPesos(detalle.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Descuento</span>
                    <span>{formatoPesos(detalle.descuento)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Impuestos</span>
                    <span>{formatoPesos(detalle.impuesto)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-extrabold text-[#087f8c]">
                    <span>Total</span>
                    <span>{formatoPesos(detalle.total)}</span>
                  </div>
                </div>
                                <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                  {errorDescarga && (
                    <p className="text-sm font-semibold text-red-500">{errorDescarga}</p>
                  )}
                  <button
                    onClick={cerrarDetalle}
                    className="rounded-xl border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={descargarPdf}
                    disabled={descargando}
                    className="rounded-xl bg-[#087f8c] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {descargando ? "Generando..." : "📄 Descargar PDF"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConsultaFacturas;
