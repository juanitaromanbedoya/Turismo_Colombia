import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

function Servicios() {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [carrito, setCarrito] = useState([]); // [{ servicio, cantidad }]
  const [enviandoReserva, setEnviandoReserva] = useState(false);

  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const datos = await apiFetch("/api/servicios/publicos");
        setServicios(datos);
      } catch (error) {
        console.error(error);
        setError(
          "No se pudo conectar con el servidor. Verifica que el Backend esté ejecutándose."
        );
      } finally {
        setCargando(false);
      }
    };

    cargarServicios();
  }, []);

  const agregarAlCarrito = (servicio) => {
    setCarrito((actual) => {
      const existente = actual.find((item) => item.servicio.id_servicio === servicio.id_servicio);
      if (existente) {
        return actual.map((item) =>
          item.servicio.id_servicio === servicio.id_servicio
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...actual, { servicio, cantidad: 1 }];
    });
    toast.success(`${servicio.nombre} agregado`);
  };

  const cambiarCantidad = (idServicio, delta) => {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.servicio.id_servicio === idServicio
            ? { ...item, cantidad: item.cantidad + delta }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const totalCarrito = carrito.reduce(
    (acum, item) => acum + Number(item.servicio.precio) * item.cantidad,
    0
  );

  const confirmarReserva = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Debes iniciar sesión para reservar.");
      navigate("/login");
      return;
    }

    try {
      setEnviandoReserva(true);

      const items = carrito.map((item) => ({
        id_servicio: item.servicio.id_servicio,
        cantidad: item.cantidad,
      }));

      const factura = await apiFetch("/api/reservas/", {
        method: "POST",
        body: JSON.stringify({ items }),
      });

      toast.success("¡Reserva confirmada! Revisa tu factura en tu panel.");
      setCarrito([]);
      navigate("/panel-cliente");
    } catch (error) {
      toast.error(error.message || "No se pudo completar la reserva.");
    } finally {
      setEnviandoReserva(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f6ef] pb-32">
      {/* Banner Superior */}
      <section className="bg-[#004f54] px-6 py-20 text-center text-white">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-[#f4b942]">
          Vive nuevas experiencias
        </p>
        <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
          Nuestros servicios
        </h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/80">
          Encuentra todo lo que necesitas para disfrutar de una experiencia
          inolvidable mientras descubres la magia de Colombia.
        </p>
      </section>

      {/* Contenido */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        {cargando && (
          <p className="text-center text-lg font-semibold text-[#087f8c]">
            Cargando servicios...
          </p>
        )}

        {!cargando && error && (
          <div className="mx-auto max-w-xl rounded-2xl bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-600">{error}</p>
          </div>
        )}

        {!cargando && !error && servicios.length === 0 && (
          <p className="text-center text-lg text-gray-500">
            Por ahora no hay servicios disponibles. Vuelve pronto.
          </p>
        )}

        {!cargando && !error && servicios.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {servicios.map((servicio) => (
              <article
                key={servicio.id_servicio}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  {imagenesDisponibles[servicio.imagen] ? (
                    <img
                      src={imagenesDisponibles[servicio.imagen]}
                      alt={servicio.nombre}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  {servicio.categoria && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#087f8c] shadow">
                      {servicio.categoria}
                    </span>
                  )}
                </div>

                <div className="p-6 text-center">
                  <h2 className="mb-2 text-xl font-bold text-[#087f8c]">
                    {servicio.nombre}
                  </h2>

                  <p className="mb-6 leading-relaxed text-gray-600">
                    {servicio.descripcion_detallada || servicio.descripcion || "Sin descripción disponible."}
                  </p>

                  <div className="mb-4 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
                    {servicio.duracion && <span>⏱️ {servicio.duracion}</span>}
                    {servicio.ubicacion && <span>📍 {servicio.ubicacion}</span>}
                    {servicio.cupo_maximo && <span>👥 Máx. {servicio.cupo_maximo}</span>}
                  </div>

                  {(servicio.incluye_transporte || servicio.incluye_alimentacion) && (
                    <div className="mb-4 flex flex-wrap justify-center gap-2">
                      {servicio.incluye_transporte && (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          🚐 Incluye transporte
                        </span>
                      )}
                      {servicio.incluye_alimentacion && (
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                          🍽️ Incluye alimentación
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mb-4 text-lg font-extrabold text-[#004f54]">
                    ${Number(servicio.precio).toLocaleString("es-CO")}
                  </p>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => navigate(`/servicios/${servicio.id_servicio}`)}
                      className="flex-1 rounded-xl border border-[#087f8c] px-4 py-2.5 text-sm font-bold text-[#087f8c] transition hover:bg-[#087f8c]/5"
                    >
                      Saber más
                    </button>
                    <button
                      onClick={() => agregarAlCarrito(servicio)}
                      className="flex-1 rounded-xl bg-[#087f8c] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#006b75]"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* BARRA FLOTANTE DE RESERVA */}
      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white p-4 shadow-2xl">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap gap-3 overflow-x-auto">
              {carrito.map((item) => (
                <div
                  key={item.servicio.id_servicio}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-gray-50 px-3 py-2"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {item.servicio.nombre}
                  </span>
                  <button
                    onClick={() => cambiarCantidad(item.servicio.id_servicio, -1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-bold hover:bg-gray-300"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(item.servicio.id_servicio, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-sm font-bold hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 md:justify-end">
              <p className="text-lg font-extrabold text-[#004f54]">
                Total: ${totalCarrito.toLocaleString("es-CO")}
              </p>
              <button
                onClick={confirmarReserva}
                disabled={enviandoReserva}
                className="rounded-xl bg-[#f4b942] px-6 py-3 font-bold text-[#004f54] transition hover:opacity-90 disabled:opacity-60"
              >
                {enviandoReserva ? "Confirmando..." : "Confirmar reserva"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Servicios;