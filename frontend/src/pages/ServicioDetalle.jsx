import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../services/api";

import cartagena from "../assets/images/cartagena.jpg";
import ejeCafetero from "../assets/images/eje-cafetero.jpg";
import guatape from "../assets/images/guatape.jpg";
import islaRosario from "../assets/images/isla-rosario.jpg";
import medellin from "../assets/images/medellin.jpg";
import salento from "../assets/images/salento.jpg";
import tayrona from "../assets/images/tayrona.jpg";

const imagenesDisponibles = {
  "tayrona.jpg": tayrona,
  "cartagena.jpg": cartagena,
  "eje-cafetero.jpg": ejeCafetero,
  "guatape.jpg": guatape,
  "isla-rosario.jpg": islaRosario,
  "medellin.jpg": medellin,
  "salento.jpg": salento,
};

function ServicioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [reservando, setReservando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const datos = await apiFetch(`/api/servicios/publicos/${id}`);
        setServicio(datos);
      } catch (error) {
        setError(error.message || "No se pudo cargar el servicio.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const reservarAhora = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Debes iniciar sesión para reservar.");
      navigate("/login");
      return;
    }

    try {
      setReservando(true);
      await apiFetch("/api/reservas/", {
        method: "POST",
        body: JSON.stringify({
          items: [{ id_servicio: servicio.id_servicio, cantidad }],
        }),
      });

      toast.success("¡Reserva confirmada! Revisa tu panel para ver la factura.");
      navigate("/panel-cliente");
    } catch (error) {
      toast.error(error.message || "No se pudo completar la reserva.");
    } finally {
      setReservando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold text-[#087f8c]">Cargando servicio...</p>
      </div>
    );
  }

  if (error || !servicio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-red-500">
          {error || "Servicio no encontrado."}
        </p>
<Link
  to="/Servicios"
  className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#087f8c] bg-white px-4 py-2.5 font-bold text-[#087f8c] shadow-sm transition hover:bg-[#087f8c] hover:text-white"
>
  <span className="text-lg">←</span> Volver a servicios
</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6ef] px-4 py-12">
      <div className="mx-auto max-w-5xl">
<Link
  to="/Servicios"
  className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#087f8c] bg-white px-4 py-2.5 font-bold text-[#087f8c] shadow-sm transition hover:bg-[#087f8c] hover:text-white"
>
  <span className="text-lg">←</span> Volver a servicios
</Link>

        <div className="overflow-hidden rounded-3xl bg-white shadow-xl md:grid md:grid-cols-2">
          <div className="h-64 w-full bg-gray-100 md:h-full">
            {imagenesDisponibles[servicio.imagen] ? (
              <img
                src={imagenesDisponibles[servicio.imagen]}
                alt={servicio.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}
          </div>

          <div className="p-8">
            {servicio.categoria && (
              <span className="mb-3 inline-block rounded-full bg-[#087f8c]/10 px-3 py-1 text-xs font-bold text-[#087f8c]">
                {servicio.categoria}
              </span>
            )}

            <h1 className="mb-3 text-3xl font-extrabold text-[#087f8c]">
              {servicio.nombre}
            </h1>

            <p className="mb-6 leading-relaxed text-gray-600">
              {servicio.descripcion || "Sin descripción disponible."}
            </p>

            <div className="mb-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
              {servicio.duracion && (
                <div>
                  <p className="font-semibold text-gray-800">⏱️ Duración</p>
                  <p>{servicio.duracion}</p>
                </div>
              )}
              {servicio.ubicacion && (
                <div>
                  <p className="font-semibold text-gray-800">📍 Ubicación</p>
                  <p>{servicio.ubicacion}</p>
                </div>
              )}
              {servicio.cupo_maximo && (
                <div>
                  <p className="font-semibold text-gray-800">👥 Cupo máximo</p>
                  <p>{servicio.cupo_maximo} personas</p>
                </div>
              )}
            </div>

            {(servicio.incluye_transporte || servicio.incluye_alimentacion || servicio.detalle_incluye) && (
              <div className="mb-6 rounded-2xl bg-[#f8f6ef] p-4">
                <p className="mb-2 font-bold text-[#087f8c]">Este servicio incluye:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {servicio.incluye_transporte && <li>🚐 Transporte</li>}
                  {servicio.incluye_alimentacion && <li>🍽️ Alimentación</li>}
                  {servicio.detalle_incluye && <li>ℹ️ {servicio.detalle_incluye}</li>}
                </ul>
              </div>
            )}

            <p className="mb-6 text-2xl font-extrabold text-[#004f54]">
              ${Number(servicio.precio).toLocaleString("es-CO")}
              <span className="ml-1 text-sm font-normal text-gray-500">por persona</span>
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-300 px-4 py-2">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="text-xl font-bold text-[#087f8c]"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold">{cantidad}</span>
                <button
                  onClick={() =>
                    setCantidad((c) =>
                      servicio.cupo_maximo ? Math.min(servicio.cupo_maximo, c + 1) : c + 1
                    )
                  }
                  className="text-xl font-bold text-[#087f8c]"
                >
                  +
                </button>
              </div>

              <button
                onClick={reservarAhora}
                disabled={reservando}
                className="flex-1 rounded-xl bg-[#087f8c] px-6 py-3 font-bold text-white transition hover:bg-[#006b75] disabled:opacity-60"
              >
                {reservando ? "Reservando..." : "Reservar ahora"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ServicioDetalle;