import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

const TIPOS = ["Petición", "Queja", "Reclamo"];
const ESTADOS = ["Pendiente", "En proceso", "Respondida", "Cerrada"];

const coloresEstado = {
  Pendiente: "bg-yellow-100 text-yellow-700",
  "En proceso": "bg-blue-100 text-blue-700",
  Respondida: "bg-green-100 text-green-700",
  Cerrada: "bg-gray-200 text-gray-600",
};

const FORM_VACIO = { tipo: "Petición", asunto: "", descripcion: "" };

const estiloInput =
  "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#087f8c]";

function MisPQR() {
  // Formulario para registrar una solicitud
  const [form, setForm] = useState(FORM_VACIO);
  const [enviando, setEnviando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [exito, setExito] = useState("");

  // Lista de solicitudes del cliente
  const [pqrs, setPqrs] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [abierta, setAbierta] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setError("");
      try {
        const params = new URLSearchParams({ limite: 50 });
        if (filtroEstado) params.append("estado", filtroEstado);

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
  }, [filtroEstado, recarga]);

  const cambiarForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setExito("");
    setErrorForm("");

    const asunto = form.asunto.trim();
    const descripcion = form.descripcion.trim();

    if (asunto.length < 5) {
      setErrorForm("El asunto debe tener al menos 5 caracteres.");
      return;
    }
    if (descripcion.length < 10) {
      setErrorForm("La descripción debe tener al menos 10 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const creada = await apiFetch("/api/pqr/", {
        method: "POST",
        body: JSON.stringify({ tipo: form.tipo, asunto, descripcion }),
      });
      setExito(`Tu solicitud quedó registrada con el número ${creada.numero_pqr}.`);
      setForm(FORM_VACIO);
      setFiltroEstado("");
      setRecarga((n) => n + 1);
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ---------- Formulario ---------- */}
      <form onSubmit={enviar} className="rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-[#087f8c]">Registrar una solicitud</h2>
        <p className="mb-4 text-sm text-gray-500">
          Cuéntanos tu petición, queja o reclamo y haremos seguimiento.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="pqr-tipo" className="mb-1 block text-sm font-semibold text-gray-600">
              Tipo
            </label>
            <select
              id="pqr-tipo"
              name="tipo"
              value={form.tipo}
              onChange={cambiarForm}
              className={estiloInput}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="pqr-asunto" className="mb-1 block text-sm font-semibold text-gray-600">
              Asunto
            </label>
            <input
              id="pqr-asunto"
              name="asunto"
              type="text"
              value={form.asunto}
              onChange={cambiarForm}
              maxLength={150}
              placeholder="Resume tu solicitud en pocas palabras"
              className={estiloInput}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="pqr-descripcion" className="mb-1 block text-sm font-semibold text-gray-600">
            Descripción
          </label>
          <textarea
            id="pqr-descripcion"
            name="descripcion"
            rows={4}
            value={form.descripcion}
            onChange={cambiarForm}
            maxLength={1000}
            placeholder="Describe con detalle lo que ocurrió o lo que necesitas"
            className={estiloInput}
          />
          <p className="mt-1 text-right text-xs text-gray-400">{form.descripcion.length}/1000</p>
        </div>

        {errorForm && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
            {errorForm}
          </p>
        )}
        {exito && (
          <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
            {exito}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-4 rounded-xl bg-[#087f8c] px-6 py-3 font-bold text-white hover:bg-[#006b75] disabled:opacity-50"
        >
          {enviando ? "Enviando..." : "Enviar solicitud"}
        </button>
      </form>

      {/* ---------- Mis solicitudes ---------- */}
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold text-[#087f8c]">Mis solicitudes</h2>
          <div>
            <label htmlFor="pqr-filtro" className="mb-1 block text-sm font-semibold text-gray-600">
              Estado
            </label>
            <select
              id="pqr-filtro"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#087f8c]"
            >
              <option value="">Todos</option>
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>
        )}

        {cargando && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
            <p className="font-semibold text-[#087f8c]">Cargando tus solicitudes...</p>
          </div>
        )}

        {!cargando && !error && pqrs.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-xl">
            <p className="text-lg text-gray-500">No hay solicitudes para mostrar.</p>
          </div>
        )}

        <div className="space-y-3">
          {!cargando &&
            pqrs.map((p) => (
              <div key={p.id_pqr} className="overflow-hidden rounded-2xl bg-white shadow-xl">
                <button
                  onClick={() => setAbierta(abierta === p.id_pqr ? null : p.id_pqr)}
                  className="flex w-full flex-col gap-2 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {p.numero_pqr} · {p.tipo} ·{" "}
                      {new Date(p.fecha_creacion).toLocaleString("es-CO")}
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#087f8c]">{p.asunto}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        coloresEstado[p.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.estado}
                    </span>
                    <span className="text-gray-400">{abierta === p.id_pqr ? "▲" : "▼"}</span>
                  </div>
                </button>

                {abierta === p.id_pqr && (
                  <div className="space-y-3 border-t border-gray-100 p-5 text-sm">
                    <div>
                      <p className="font-bold text-gray-700">Tu solicitud</p>
                      <p className="mt-1 whitespace-pre-line text-gray-600">{p.descripcion}</p>
                    </div>

                    {p.respuesta ? (
                      <div className="rounded-xl bg-green-50 p-4">
                        <p className="font-bold text-green-700">Respuesta</p>
                        <p className="mt-1 whitespace-pre-line text-gray-700">{p.respuesta}</p>
                        <p className="mt-2 text-xs text-gray-500">
                          {p.respondido_por &&
                            `${p.respondido_por.nombre} ${p.respondido_por.apellido} · `}
                          {p.fecha_respuesta &&
                            new Date(p.fecha_respuesta).toLocaleString("es-CO")}
                        </p>
                      </div>
                    ) : (
                      <p className="rounded-xl bg-gray-50 p-4 text-gray-500">
                        Aún no hay una respuesta. Te avisaremos por aquí cuando la tengamos.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default MisPQR;