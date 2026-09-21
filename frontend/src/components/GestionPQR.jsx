import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

const LIMITE = 10;
const TIPOS = ["Petición", "Queja", "Reclamo"];
const ESTADOS = ["Pendiente", "En proceso", "Respondida", "Cerrada"];

const FILTROS_VACIOS = { estado: "", tipo: "", cliente: "", fecha_desde: "", fecha_hasta: "" };

const coloresEstado = {
  Pendiente: "bg-yellow-100 text-yellow-700",
  "En proceso": "bg-blue-100 text-blue-700",
  Respondida: "bg-green-100 text-green-700",
  Cerrada: "bg-gray-200 text-gray-600",
};

const estiloInput =
  "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#087f8c]";

function GestionPQR() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);       // lo que se escribe
  const [aplicados, setAplicados] = useState(FILTROS_VACIOS);   // lo que se consulta
  const [pagina, setPagina] = useState(1);
  const [pqrs, setPqrs] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [errorFiltros, setErrorFiltros] = useState("");
  const [recarga, setRecarga] = useState(0);

  // Ventana de gestión de una PQR
  const [seleccionada, setSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [cerrarAlResponder, setCerrarAlResponder] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGestion, setErrorGestion] = useState("");
  const [exitoGestion, setExitoGestion] = useState("");

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

        const datos = await apiFetch(`/api/pqr/?${params.toString()}`);
        if (!cancelado) setPqrs(datos);
      } catch (err) {
        if (!cancelado) {
          setError(err.message);
          setPqrs([]);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [aplicados, pagina, recarga]);

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
    setPagina(1);
    setAplicados({ ...filtros });
  };

  const limpiar = () => {
    setErrorFiltros("");
    setFiltros(FILTROS_VACIOS);
    setAplicados(FILTROS_VACIOS);
    setPagina(1);
  };

  // ---------- Ventana de gestión ----------
  const abrir = (p) => {
    setSeleccionada(p);
    setNuevoEstado(p.estado);
    setTextoRespuesta("");
    setCerrarAlResponder(false);
    setErrorGestion("");
    setExitoGestion("");
  };

  const cerrarVentana = () => setSeleccionada(null);

  const guardar = async (cuerpo, mensajeExito) => {
    setGuardando(true);
    setErrorGestion("");
    setExitoGestion("");
    try {
      const actualizada = await apiFetch(`/api/pqr/${seleccionada.id_pqr}`, {
        method: "PATCH",
        body: JSON.stringify(cuerpo),
      });
      setSeleccionada(actualizada);
      setNuevoEstado(actualizada.estado);
      setTextoRespuesta("");
      setCerrarAlResponder(false);
      setExitoGestion(mensajeExito);
      setRecarga((n) => n + 1);
    } catch (err) {
      setErrorGestion(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const actualizarEstado = () => {
    if (nuevoEstado === seleccionada.estado) {
      setErrorGestion("Selecciona un estado distinto al actual.");
      return;
    }
    guardar({ estado: nuevoEstado }, "Estado actualizado.");
  };

  const enviarRespuesta = () => {
    const texto = textoRespuesta.trim();
    if (texto.length < 5) {
      setErrorGestion("Escribe una respuesta de al menos 5 caracteres.");
      return;
    }
    guardar(
      { respuesta: texto, estado: cerrarAlResponder ? "Cerrada" : "Respondida" },
      cerrarAlResponder ? "Respuesta enviada y PQR cerrada." : "Respuesta enviada."
    );
  };

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-[#087f8c]">Gestión de PQR</h2>
      <p className="mb-6 text-sm text-gray-500">
        Revisa las peticiones, quejas y reclamos de los clientes, cambia su estado y respóndelas.
      </p>

      {/* ---------- Filtros ---------- */}
      <form onSubmit={buscar} className="mb-6 rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="gpqr-estado" className="mb-1 block text-sm font-semibold text-gray-600">
              Estado
            </label>
            <select
              id="gpqr-estado"
              name="estado"
              value={filtros.estado}
              onChange={cambiarFiltro}
              className={estiloInput}
            >
              <option value="">Todos</option>
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gpqr-tipo" className="mb-1 block text-sm font-semibold text-gray-600">
              Tipo
            </label>
            <select
              id="gpqr-tipo"
              name="tipo"
              value={filtros.tipo}
              onChange={cambiarFiltro}
              className={estiloInput}
            >
              <option value="">Todos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gpqr-cliente" className="mb-1 block text-sm font-semibold text-gray-600">
              Cliente
            </label>
            <input
              id="gpqr-cliente"
              name="cliente"
              type="text"
              value={filtros.cliente}
              onChange={cambiarFiltro}
              placeholder="Nombre o documento"
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="gpqr-desde" className="mb-1 block text-sm font-semibold text-gray-600">
              Desde
            </label>
            <input
              id="gpqr-desde"
              name="fecha_desde"
              type="date"
              value={filtros.fecha_desde}
              onChange={cambiarFiltro}
              className={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="gpqr-hasta" className="mb-1 block text-sm font-semibold text-gray-600">
              Hasta
            </label>
            <input
              id="gpqr-hasta"
              name="fecha_hasta"
              type="date"
              value={filtros.fecha_hasta}
              onChange={cambiarFiltro}
              className={estiloInput}
            />
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
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">N° PQR</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Asunto</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Cargando PQR...
                </td>
              </tr>
            ) : pqrs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay PQR para mostrar.
                </td>
              </tr>
            ) : (
              pqrs.map((p) => (
                <tr key={p.id_pqr} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 font-semibold text-[#087f8c]">{p.numero_pqr}</td>
                  <td className="px-4 py-3">
                    {new Date(p.fecha_creacion).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-700">
                      {p.cliente.nombre} {p.cliente.apellido}
                    </p>
                    <p className="text-xs text-gray-500">{p.cliente.correo}</p>
                  </td>
                  <td className="px-4 py-3">{p.tipo}</td>
                  <td className="max-w-xs px-4 py-3">{p.asunto}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        coloresEstado[p.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => abrir(p)}
                      className="rounded-lg bg-[#087f8c] px-3 py-2 text-xs font-bold text-white hover:bg-[#006b75]"
                    >
                      Gestionar
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
          disabled={pqrs.length < LIMITE || cargando}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>

      {/* ---------- Ventana de gestión ---------- */}
      {seleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={cerrarVentana}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500">
                  {seleccionada.tipo}
                </p>
                <h3 className="text-2xl font-extrabold text-[#087f8c]">
                  {seleccionada.numero_pqr}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(seleccionada.fecha_creacion).toLocaleString("es-CO")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    coloresEstado[seleccionada.estado] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {seleccionada.estado}
                </span>
                <button
                  onClick={cerrarVentana}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-gray-50 p-4 text-sm">
              <p className="font-bold text-gray-700">Cliente</p>
              <p>
                {seleccionada.cliente.nombre} {seleccionada.cliente.apellido}
              </p>
              <p className="text-gray-600">{seleccionada.cliente.correo}</p>
            </div>

            <div className="mb-4 text-sm">
              <p className="font-bold text-gray-700">{seleccionada.asunto}</p>
              <p className="mt-1 whitespace-pre-line text-gray-600">{seleccionada.descripcion}</p>
            </div>

            {seleccionada.respuesta && (
              <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm">
                <p className="font-bold text-green-700">Respuesta enviada</p>
                <p className="mt-1 whitespace-pre-line text-gray-700">{seleccionada.respuesta}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {seleccionada.respondido_por &&
                    `${seleccionada.respondido_por.nombre} ${seleccionada.respondido_por.apellido} · `}
                  {seleccionada.fecha_respuesta &&
                    new Date(seleccionada.fecha_respuesta).toLocaleString("es-CO")}
                </p>
              </div>
            )}

            {errorGestion && (
              <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
                {errorGestion}
              </p>
            )}
            {exitoGestion && (
              <p className="mb-3 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
                {exitoGestion}
              </p>
            )}

            {seleccionada.estado === "Cerrada" ? (
              <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                Esta PQR está cerrada y ya no se puede modificar.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Cambiar estado */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="mb-2 text-sm font-bold text-gray-700">Cambiar estado</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={nuevoEstado}
                      onChange={(e) => setNuevoEstado(e.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#087f8c]"
                    >
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={actualizarEstado}
                      disabled={guardando}
                      className="rounded-xl bg-[#087f8c] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      Actualizar estado
                    </button>
                  </div>
                </div>

                {/* Responder */}
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="mb-2 text-sm font-bold text-gray-700">
                    {seleccionada.respuesta ? "Actualizar respuesta" : "Responder"}
                  </p>
                  <textarea
                    rows={4}
                    value={textoRespuesta}
                    onChange={(e) => setTextoRespuesta(e.target.value)}
                    maxLength={1000}
                    placeholder="Escribe la respuesta para el cliente"
                    className={estiloInput}
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{textoRespuesta.length}/1000</p>

                  <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={cerrarAlResponder}
                      onChange={(e) => setCerrarAlResponder(e.target.checked)}
                    />
                    Cerrar la PQR al responder
                  </label>

                  <button
                    onClick={enviarRespuesta}
                    disabled={guardando}
                    className="mt-3 rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {guardando ? "Guardando..." : "Enviar respuesta"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionPQR;