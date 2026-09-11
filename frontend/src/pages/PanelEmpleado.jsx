import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EditarPerfil from "../components/EditarPerfil";
import ServicioModal from "../components/ServicioModal";

function PanelEmpleado({ seccion, setSeccion }) {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario"))
  );

  const [servicios, setServicios] = useState([]);
  const [cargandoServicios, setCargandoServicios] = useState(false);
  const [errorServicios, setErrorServicios] = useState("");

  const [mostrarServicioModal, setMostrarServicioModal] = useState(false);
  const [servicioEditar, setServicioEditar] = useState(null);

  const token = localStorage.getItem("token");


useEffect(() => {
  if (!token || !usuario) {
    navigate("/login");
    return;
  }

  // Verificar que sea empleado
  if (usuario.rol !== "Empleado") {
    navigate("/");
  }
}, [token, usuario, navigate]);

  // =========================================================
  // CARGAR SERVICIOS
  // =========================================================

  const cargarServicios = async () => {
  try {
    setCargandoServicios(true);
    setErrorServicios("");

    const datos = await apiFetch("/api/servicios/");
    setServicios(datos);
  } catch (error) {
    console.error(error);
    setErrorServicios(error.message || "No se pudieron cargar los servicios.");
  } finally {
    setCargandoServicios(false);
  }
};

  useEffect(() => {
    if (seccion === "servicios" && token) {
      cargarServicios();
    }
  }, [seccion, token]);

  // =========================================================
  // CREAR SERVICIO
  // =========================================================

  const abrirCrearServicio = () => {
    setServicioEditar(null);
    setMostrarServicioModal(true);
  };

  // =========================================================
  // EDITAR SERVICIO
  // =========================================================

  const abrirEditarServicio = (servicio) => {
    setServicioEditar(servicio);
    setMostrarServicioModal(true);
  };

  // =========================================================
  // GUARDAR SERVICIO
  // =========================================================

const guardarServicio = async (datosServicio) => {
  try {
    const endpoint = servicioEditar
      ? `/api/servicios/${servicioEditar.id_servicio}`
      : "/api/servicios/";

    const metodo = servicioEditar ? "PUT" : "POST";

    const cuerpo = servicioEditar
      ? { ...datosServicio, estado: servicioEditar.estado }
      : datosServicio;

    await apiFetch(endpoint, {
      method: metodo,
      body: JSON.stringify(cuerpo),
    });

    toast.success(
      servicioEditar
        ? "Servicio actualizado correctamente."
        : "Servicio creado correctamente."
    );

    setMostrarServicioModal(false);
    setServicioEditar(null);
    await cargarServicios();
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Error al guardar el servicio.");
  }
};

  // =========================================================
  // DATOS DEL RESUMEN
  // =========================================================

  const serviciosActivos = servicios.filter(
    (servicio) => servicio.estado
  ).length;

  const serviciosInactivos = servicios.filter(
    (servicio) => !servicio.estado
  ).length;

  // =========================================================
  // ACTUALIZAR USUARIO DESPUÉS DE EDITAR PERFIL
  // =========================================================

  const actualizarUsuario = () => {
    const usuarioActualizado = JSON.parse(
      localStorage.getItem("usuario")
    );

    setUsuario(usuarioActualizado);
  };

  // =========================================================
  // SESIÓN
  // =========================================================

  if (!usuario) {
    return null;
  }

  // =========================================================
  // VISTA
  // =========================================================

  return (
    <section className="min-h-screen bg-[#f8f6ef] px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}

        <div className="mb-8">

          <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
            Turismo Colombia
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-[#087f8c]">
            Panel de Empleado
          </h1>

          <p className="mt-2 text-gray-600">
            Bienvenido, {usuario.nombre} {usuario.apellido}.
          </p>

        </div>


        {/* =====================================================
            RESUMEN
        ===================================================== */}

        {seccion === "resumen" && (
          <div className="space-y-6">

            {/* ENCABEZADO DEL DASHBOARD */}

            <div className="rounded-2xl bg-white p-8 shadow-xl">

              <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
                Dashboard
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-[#087f8c]">
                Resumen general
              </h2>

              <p className="mt-2 text-gray-600">
                Consulta rápidamente el estado de los servicios
                administrados por Turismo Colombia.
              </p>

            </div>

            {/* TARJETAS */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {/* TOTAL */}

              <div className="rounded-2xl bg-white p-6 shadow-lg">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-gray-500">
                      Total servicios
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-[#087f8c]">
                      {servicios.length}
                    </p>

                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#087f8c]/10 text-2xl">
                    🛎️
                  </div>

                </div>

              </div>

              {/* ACTIVOS */}

              <div className="rounded-2xl bg-white p-6 shadow-lg">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-gray-500">
                      Servicios activos
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-green-600">
                      {serviciosActivos}
                    </p>

                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                    ✅
                  </div>

                </div>

              </div>

              {/* INACTIVOS */}

              <div className="rounded-2xl bg-white p-6 shadow-lg">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-gray-500">
                      Servicios inactivos
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-red-500">
                      {serviciosInactivos}
                    </p>

                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
                    ❌
                  </div>

                </div>

              </div>

            </div>

            {/* ESTADO */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div className="rounded-2xl bg-white p-7 shadow-lg">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-semibold text-gray-500">
                      Porcentaje de servicios activos
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-green-600">
                      {servicios.length > 0
                        ? Math.round(
                            (serviciosActivos /
                              servicios.length) *
                              100
                          )
                        : 0}
                      %
                    </p>

                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                    📈
                  </div>

                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${
                        servicios.length > 0
                          ? (serviciosActivos /
                              servicios.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />

                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Porcentaje de servicios actualmente disponibles.
                </p>

              </div>

              {/* ACCESO RÁPIDO */}

              <div className="rounded-2xl bg-white p-7 shadow-lg">

                <p className="text-sm font-semibold text-gray-500">
                  Gestión rápida
                </p>

                <h3 className="mt-2 text-2xl font-extrabold text-[#087f8c]">
                  Administrar servicios
                </h3>

                <p className="mt-2 text-gray-500">
                  Crea nuevos servicios o modifica los existentes.
                </p>

                <button
                  onClick={() => setSeccion("servicios")}
                  className="mt-5 rounded-xl bg-[#087f8c] px-5 py-3 font-bold text-white shadow hover:bg-[#006b75]"
                >
                  Ir a servicios →
                </button>

              </div>

            </div>

            {/* INFORMACIÓN GENERAL */}

            <div className="rounded-2xl bg-[#004f54] p-8 text-white shadow-xl">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
                    Turismo Colombia
                  </p>

                  <h3 className="mt-2 text-2xl font-extrabold">
                    Área de trabajo del empleado
                  </h3>

                  <p className="mt-2 max-w-2xl text-white/80">
                    Desde este panel puedes consultar y gestionar
                    los servicios disponibles para los usuarios
                    de Turismo Colombia.
                  </p>

                </div>

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/10 text-4xl">
                  💼
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            SERVICIOS
        ===================================================== */}

        {seccion === "servicios" && (
          <div className="rounded-2xl bg-white p-8 shadow-xl">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
                  Gestión
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-[#087f8c]">
                  Servicios
                </h2>

                <p className="mt-2 text-gray-600">
                  Consulta y administra los servicios de Turismo Colombia.
                </p>

              </div>

              <button
                onClick={abrirCrearServicio}
                className="rounded-xl bg-[#087f8c] px-5 py-3 font-bold text-white shadow hover:bg-[#006b75]"
              >
                + Crear servicio
              </button>

            </div>

            {/* CARGANDO */}

            {cargandoServicios && (
              <div className="mt-8 rounded-xl bg-[#f8f6ef] p-8 text-center">

                <p className="font-semibold text-[#087f8c]">
                  Cargando servicios...
                </p>

              </div>
            )}

            {/* ERROR */}

            {!cargandoServicios && errorServicios && (
              <div className="mt-8 rounded-xl bg-red-50 p-6 text-center">

                <p className="font-semibold text-red-600">
                  {errorServicios}
                </p>

              </div>
            )}

            {/* TABLA */}

            {!cargandoServicios && !errorServicios && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100">

                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead className="bg-[#004f54] text-white">

                      <tr>

                        <th className="px-5 py-4">
                          ID
                        </th>

                        <th className="px-5 py-4">
                          Servicio
                        </th>

                        <th className="px-5 py-4">
                          Descripción
                        </th>

                        <th className="px-5 py-4">
                          Precio
                        </th>

                        <th className="px-5 py-4">
                          Estado
                        </th>

                        <th className="px-5 py-4">
                          Acciones
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {servicios.length === 0 ? (

                        <tr>

                          <td
                            colSpan="6"
                            className="px-5 py-10 text-center text-gray-500"
                          >
                            No hay servicios registrados.
                          </td>

                        </tr>

                      ) : (

                        servicios.map((servicio) => (

                          <tr
                            key={servicio.id_servicio}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >

                            <td className="px-5 py-4">
                              {servicio.id_servicio}
                            </td>

                            <td className="px-5 py-4 font-semibold text-[#087f8c]">
                              {servicio.nombre}
                            </td>

                            <td className="max-w-sm px-5 py-4 text-gray-600">
                              {servicio.descripcion ||
                                "Sin descripción"}
                            </td>

                            <td className="px-5 py-4 font-semibold">
                              $
                              {Number(
                                servicio.precio
                              ).toLocaleString("es-CO")}
                            </td>

                            <td className="px-5 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                                  servicio.estado
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {servicio.estado
                                  ? "Activo"
                                  : "Inactivo"}
                              </span>

                            </td>

                            <td className="px-5 py-4">

                              <div className="flex flex-wrap gap-2">

                                <button
                                  onClick={() =>
                                    abrirEditarServicio(
                                      servicio
                                    )
                                  }
                                  className="rounded-lg bg-[#087f8c] px-3 py-2 text-sm font-bold text-white hover:bg-[#006b75]"
                                >
                                  Editar
                                </button>

                              </div>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

          </div>
        )}

        {/* =====================================================
            PERFIL
        ===================================================== */}

        {seccion === "perfil" && (
          <EditarPerfil
            onCerrar={() => {
              actualizarUsuario();
              setSeccion("resumen");
            }}
          />
        )}

        {/* =====================================================
            MODAL DE SERVICIO
        ===================================================== */}

        {mostrarServicioModal && (
          <ServicioModal
            servicio={servicioEditar}
            onClose={() => {
              setMostrarServicioModal(false);
              setServicioEditar(null);
            }}
            onGuardar={guardarServicio}
          />
        )}

      </div>
    </section>
  );
}

export default PanelEmpleado;

