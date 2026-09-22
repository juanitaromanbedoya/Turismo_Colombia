import { useEffect, useState } from "react";
import EditarPerfil from "../components/EditarPerfil";
import { apiFetch } from "../services/api";
import toast from "react-hot-toast";
import ConsultaFacturas from "../components/ConsultaFacturas";
import MisPQR from "../components/MisPQR";
import DashboardResumen from "../components/DashboardResumen";
import DashboardVentas from "../components/DashboardVentas";

function PanelCliente() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
    const [seccion, setSeccion] = useState("resumen");

  const [facturas, setFacturas] = useState([]);
  const [cargandoFacturas, setCargandoFacturas] = useState(false);
  const [errorFacturas, setErrorFacturas] = useState("");
  const [facturaAbierta, setFacturaAbierta] = useState(null);

  useEffect(() => {
    if (seccion === "reservas") {
      cargarFacturas();
    }
  }, [seccion]);

  const cargarFacturas = async () => {
    try {
      setCargandoFacturas(true);
      setErrorFacturas("");
      const datos = await apiFetch("/api/reservas/mis-facturas");
      setFacturas(datos);
    } catch (error) {
      setErrorFacturas(error.message || "No se pudieron cargar tus reservas.");
    } finally {
      setCargandoFacturas(false);
    }
  };

  const [editarPerfil, setEditarPerfil] = useState(false);

  if (!usuario) {
    return null;
  }

  return (
    <section className="min-h-screen bg-[#f8f6ef] px-4 py-12">
      <div className="mx-auto max-w-5xl">

        {/* ENCABEZADO */}
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
            Turismo Colombia
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-[#087f8c]">
            Panel de Cliente
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Bienvenido, {usuario.nombre} {usuario.apellido}.
          </p>
        </div>

        {/* MENÚ DE SECCIONES */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setSeccion("perfil")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "perfil"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            👤 Mi perfil
          </button>
          <button
            onClick={() => setSeccion("resumen")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "resumen"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            📊 Mi resumen
          </button>
          <button
            onClick={() => setSeccion("mis-graficos")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "mis-graficos"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            📈 Mis gráficos
          </button>

          <button
            onClick={() => setSeccion("reservas")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "reservas"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            🧾 Mis reservas
          </button>
                    <button
            onClick={() => setSeccion("facturas")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "facturas"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            📑 Mis facturas
          </button>
          <button
            onClick={() => setSeccion("pqr")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "pqr"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            💬 Mis PQR
          </button>
        </div>

        {/* SECCIÓN PERFIL */}
        {seccion === "perfil" && (
          !editarPerfil ? (
            <div className="rounded-3xl bg-white p-10 shadow-xl">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-500">Nombre</p>
                  <p className="mt-1 text-lg font-bold text-gray-800">
                    {usuario.nombre} {usuario.apellido}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-500">Documento</p>
                  <p className="mt-1 text-lg font-bold text-gray-800">
                    {usuario.numero_documento || "No registrado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-500">Correo</p>
                  <p className="mt-1 text-lg font-bold text-gray-800">
                    {usuario.correo}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-500">Rol</p>
                  <p className="mt-1 text-lg font-bold text-gray-800">Cliente</p>
                </div>
              </div>

              <button
                onClick={() => setEditarPerfil(true)}
                className="mt-8 rounded-xl bg-[#087f8c] px-6 py-3 font-bold text-white shadow hover:bg-[#006b75]"
              >
                ✏️ Editar mis datos
              </button>
            </div>
          ) : (
            <EditarPerfil onCerrar={() => setEditarPerfil(false)} />
          )
        )}

        {/* SECCIÓN MIS RESERVAS */}
        {seccion === "reservas" && (
          <div className="space-y-4">

            {cargandoFacturas && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
                <p className="font-semibold text-[#087f8c]">Cargando tus reservas...</p>
              </div>
            )}

            {!cargandoFacturas && errorFacturas && (
              <div className="rounded-2xl bg-red-50 p-6 text-center shadow-xl">
                <p className="font-semibold text-red-600">{errorFacturas}</p>
              </div>
            )}

            {!cargandoFacturas && !errorFacturas && facturas.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-xl">
                <p className="text-lg text-gray-500">
                  Aún no has hecho ninguna reserva.
                </p>
              </div>
            )}

            {!cargandoFacturas && !errorFacturas && facturas.map((factura) => (
              <div
                key={factura.id_factura}
                className="overflow-hidden rounded-2xl bg-white shadow-xl"
              >
                <button
                  onClick={() =>
                    setFacturaAbierta(
                      facturaAbierta === factura.id_factura ? null : factura.id_factura
                    )
                  }
                  className="flex w-full flex-col gap-2 p-6 text-left sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Factura #{factura.id_factura} —{" "}
                      {new Date(factura.fecha_emision).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#087f8c]">
                      {factura.reservas.length} servicio{factura.reservas.length !== 1 && "s"} reservado{factura.reservas.length !== 1 && "s"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        factura.estado === "Emitida"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {factura.estado}
                    </span>
                    <p className="text-xl font-extrabold text-[#004f54]">
                      ${Number(factura.total).toLocaleString("es-CO")}
                    </p>
                    <span className="text-gray-400">
                      {facturaAbierta === factura.id_factura ? "▲" : "▼"}
                    </span>
                  </div>
                </button>

                {facturaAbierta === factura.id_factura && (
                  <div className="border-t border-gray-100 p-6">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="pb-2">Servicio</th>
                          <th className="pb-2">Cantidad</th>
                          <th className="pb-2">Precio unitario</th>
                          <th className="pb-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {factura.reservas.map((reserva) => (
                          <tr key={reserva.id_reserva} className="border-t border-gray-100">
                            <td className="py-2 font-semibold text-gray-700">
                              {reserva.servicio.nombre}
                            </td>
                            <td className="py-2">{reserva.cantidad}</td>
                            <td className="py-2">
                              ${Number(reserva.precio_unitario).toLocaleString("es-CO")}
                            </td>
                            <td className="py-2 text-right font-semibold">
                              ${Number(reserva.subtotal).toLocaleString("es-CO")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {seccion === "facturas" && <ConsultaFacturas esCliente />}
        {seccion === "pqr" && <MisPQR />}
        {seccion === "resumen" && <DashboardResumen />}
        {seccion === "mis-graficos" && <DashboardVentas />}

      </div>
    </section>
  );
}

export default PanelCliente;