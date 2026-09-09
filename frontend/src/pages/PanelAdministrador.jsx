import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EditarPerfil from "../components/EditarPerfil";
import UsuarioModal from "../components/UsuarioModal";
import ServicioModal from "../components/ServicioModal";

function PanelAdministrador() {
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState("resumen");

  const [usuarios, setUsuarios] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoServicios, setCargandoServicios] = useState(false);

  const [error, setError] = useState("");
  const [errorServicios, setErrorServicios] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);

  const [mostrarServicioModal, setMostrarServicioModal] = useState(false);
  const [servicioEditar, setServicioEditar] = useState(null);

  const token = localStorage.getItem("token");

useEffect(() => {
  const cargarUsuarios = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const datos = await apiFetch("/api/usuarios/");
      setUsuarios(datos);
    } catch (error) {
      toast.error(error);
      setError(error.message || "No tienes permiso para acceder.");
    } finally {
      setCargando(false);
    }
  };

  cargarUsuarios();
}, [navigate, token]);

  const cargarServicios = async () => {
    try {
      setCargandoServicios(true);
      setErrorServicios("");

      const datos = await apiFetch("/api/servicios/");

      setServicios(datos);
    } catch (error) {
      toast.error(error);
      setErrorServicios(error.message || "No se pudo conectar con el Backend.");
    } finally {
      setCargandoServicios(false);
    }
  };

  useEffect(() => {
    if (seccion === "servicios" && token) {
      cargarServicios();
    }
  }, [seccion, token]);

  const abrirAgregarUsuario = () => {
    setUsuarioEditar(null);
    setMostrarModal(true);
  };

  const abrirEditarUsuario = (usuario) => {
    setUsuarioEditar(usuario);
    setMostrarModal(true);
  };

    const guardarUsuario = async (datosUsuario) => {
    try {
      const endpoint = usuarioEditar
        ? `/api/usuarios/${usuarioEditar.id_usuario}`
        : "/api/usuarios/registro";

      const metodo = usuarioEditar ? "PUT" : "POST";

      await apiFetch(endpoint, {
        method: metodo,
        body: JSON.stringify(datosUsuario),
      });

      toast.success(
        usuarioEditar
          ? "Usuario actualizado correctamente."
          : "Usuario agregado correctamente."
      );

      setMostrarModal(false);
      setUsuarioEditar(null);

      // Recargar usuarios
      const usuariosActualizados = await apiFetch("/api/usuarios/");
      setUsuarios(usuariosActualizados);
    } catch (error) {
      toast.error(error.message || "Error al guardar el usuario.");
    }
  };
  const cambiarEstado = async (id, estadoActual) => {
    try {
      await apiFetch(`/api/usuarios/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: !estadoActual }),
      });

      setUsuarios((usuariosActuales) =>
        usuariosActuales.map((usuario) =>
          usuario.id_usuario === id
            ? { ...usuario, estado: !estadoActual }
            : usuario
        )
      );

      toast.success("Estado actualizado correctamente.");
    } catch (error) {
      toast.error(error.message || "Error al cambiar el estado.");
    }
  };

    const eliminarUsuario = async (id) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este usuario?"
    );

    if (!confirmar) {
      return;
    }

    try {
      await apiFetch(`/api/usuarios/${id}`, { method: "DELETE" });

      setUsuarios((usuariosActuales) =>
        usuariosActuales.map((usuario) =>
          usuario.id_usuario === id
            ? { ...usuario, estado: false }
            : usuario
        )
      );

      toast.success("Usuario eliminado (desactivado) correctamente.");
    } catch (error) {
      toast.error(error.message || "Error al eliminar el usuario.");
    }
  };

   // =========================
  // SERVICIOS
  // =========================

  const abrirCrearServicio = () => {
    setServicioEditar(null);
    setMostrarServicioModal(true);
  };

  const abrirEditarServicio = (servicio) => {
    setServicioEditar(servicio);
    setMostrarServicioModal(true);
  };

  const guardarServicio = async (datosServicio) => {
    try {
      const endpoint = servicioEditar
        ? `/api/servicios/${servicioEditar.id_servicio}`
        : "/api/servicios/";

      const metodo = servicioEditar ? "PUT" : "POST";

      const cuerpo = servicioEditar
        ? {
            ...datosServicio,
            estado: servicioEditar.estado,
          }
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
      toast.error(error);
      toast.error(error.message || "Error al guardar el servicio.");
    }
  };

    const cambiarEstadoServicio = async (id, estadoActual) => {
    const accion = estadoActual ? "desactivar" : "activar";

    const confirmar = window.confirm(
      `¿Seguro que deseas ${accion} este servicio?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await apiFetch(`/api/servicios/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: !estadoActual }),
      });

      setServicios((serviciosActuales) =>
        serviciosActuales.map((servicio) =>
          servicio.id_servicio === id
            ? { ...servicio, estado: !estadoActual }
            : servicio
        )
      );

      toast.success(
        estadoActual
          ? "Servicio desactivado correctamente."
          : "Servicio activado correctamente."
      );
    } catch (error) {
      toast.error(error.message || "Error al cambiar el estado del servicio.");
    }
  };

  // =========================
  // CARGANDO
  // =========================

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold text-[#087f8c]">
          Cargando panel de administrador...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-red-500">
            Acceso denegado
          </h2>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-[#087f8c] px-6 py-3 font-bold text-white hover:bg-[#006b75]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // PANEL
  // =========================

  return (
    <section className="min-h-screen bg-[#f8f6ef] px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* ENCABEZADO */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
            Administración
          </p>

          <h1 className="mt-2 text-4xl font-extrabold text-[#087f8c]">
            Panel de Administrador
          </h1>

          <p className="mt-2 text-gray-600">
            Administra usuarios, servicios y la información de
            Turismo Colombia.
          </p>

          {seccion === "usuarios" && (
            <button
              onClick={abrirAgregarUsuario}
              className="mt-5 rounded-xl bg-[#087f8c] px-5 py-3 font-bold text-white shadow hover:bg-[#006b75]"
            >
              + Agregar usuario
            </button>
          )}
        </div>

        {/* =========================
            MENÚ
        ========================= */}

        <div className="mb-8 flex flex-wrap gap-3">

          <button
            onClick={() => setSeccion("resumen")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "resumen"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            📊 Resumen
          </button>

          <button
            onClick={() => setSeccion("usuarios")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "usuarios"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            👥 Usuarios
          </button>

          <button
            onClick={() => setSeccion("servicios")}
            className={`rounded-xl px-5 py-3 font-bold transition ${
              seccion === "servicios"
                ? "bg-[#087f8c] text-white"
                : "bg-white text-gray-600 shadow hover:bg-gray-100"
            }`}
          >
            🛎️ Servicios
          </button>

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

        </div>

        {/* =========================
            RESUMEN
        ========================= */}

        {seccion === "resumen" && (
          <div className="space-y-6">

            {/* Encabezado */}
            <div className="rounded-2xl bg-white p-8 shadow-xl">

              <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
                Dashboard
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-[#087f8c]">
                Resumen general
              </h2>

              <p className="mt-2 text-gray-600">
                Consulta rápidamente el estado de los usuarios
                registrados en Turismo Colombia.
              </p>

            </div>

            {/* TARJETAS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {/* Total */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Total usuarios
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-[#087f8c]">
                      {usuarios.length}
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#087f8c]/10 text-2xl">
                    👥
                  </div>

                </div>
              </div>

              {/* Clientes */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Clientes
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-[#087f8c]">
                      {
                        usuarios.filter(
                          (usuario) => usuario.rol === "Cliente"
                        ).length
                      }
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                    🧑
                  </div>

                </div>
              </div>

              {/* Empleados */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Empleados
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-[#087f8c]">
                      {
                        usuarios.filter(
                          (usuario) => usuario.rol === "Empleado"
                        ).length
                      }
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-2xl">
                    👨‍💼
                  </div>

                </div>
              </div>

              {/* Administradores */}
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Administradores
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-[#087f8c]">
                      {
                        usuarios.filter(
                          (usuario) => usuario.rol === "Administrador"
                        ).length
                      }
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                    🛡️
                  </div>

                </div>
              </div>

            </div>

            {/* ESTADO DE USUARIOS */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Activos */}
              <div className="rounded-2xl bg-white p-7 shadow-lg">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Usuarios activos
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-green-600">
                      {
                        usuarios.filter(
                          (usuario) => usuario.estado
                        ).length
                      }
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
                    ✅
                  </div>

                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${
                        usuarios.length > 0
                          ? (
                              usuarios.filter(
                                (usuario) => usuario.estado
                              ).length / usuarios.length
                            ) * 100
                          : 0
                      }%`,
                    }}
                  />

                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Usuarios habilitados actualmente en el sistema.
                </p>

              </div>

              {/* Inactivos */}
              <div className="rounded-2xl bg-white p-7 shadow-lg">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Usuarios inactivos
                    </p>

                    <p className="mt-2 text-4xl font-extrabold text-red-500">
                      {
                        usuarios.filter(
                          (usuario) => !usuario.estado
                        ).length
                      }
                    </p>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
                    ❌
                  </div>

                </div>

                <p className="mt-5 text-sm text-gray-500">
                  Usuarios que actualmente no tienen acceso activo
                  al sistema.
                </p>

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
                    Estado general del sistema
                  </h3>

                  <p className="mt-2 max-w-2xl text-white/80">
                    El administrador puede consultar y gestionar
                    los usuarios registrados y los servicios
                    ofrecidos por Turismo Colombia.
                  </p>

                </div>

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/10 text-4xl">
                  📊
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =========================
            USUARIOS
        ========================= */}

        {seccion === "usuarios" && (
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-[#004f54] text-white">

                  <tr>
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Nombre</th>
                    <th className="px-5 py-4">Correo</th>
                    <th className="px-5 py-4">Rol</th>
                    <th className="px-5 py-4">Estado</th>
                    <th className="px-5 py-4">Acciones</th>
                  </tr>

                </thead>

                <tbody>

                  {usuarios.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-5 py-10 text-center text-gray-500"
                      >
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((usuario) => (
                      <tr
                        key={usuario.id_usuario}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >

                        <td className="px-5 py-4">
                          {usuario.rol}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {usuario.nombre} {usuario.apellido}
                        </td>

                        <td className="px-5 py-4">
                          {usuario.correo}
                        </td>

                        <td className="px-5 py-4">
                          {usuario.id_rol === 1
                            ? "Administrador"
                            : usuario.id_rol === 2
                            ? "Empleado"
                            : "Cliente"}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-sm font-semibold ${
                              usuario.estado
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {usuario.estado
                              ? "Activo"
                              : "Inactivo"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex flex-wrap gap-2">

                            <button
                              onClick={() =>
                                abrirEditarUsuario(usuario)
                              }
                              className="rounded-lg bg-[#087f8c] px-3 py-2 text-sm font-bold text-white hover:bg-[#006b75]"
                            >
                              Editar
                            </button>

                            <button
                              onClick={() =>
                                cambiarEstado(
                                  usuario.id_usuario,
                                  usuario.estado
                                )
                              }
                              className="rounded-lg bg-[#f4b942] px-3 py-2 text-sm font-bold text-white hover:opacity-90"
                            >
                              {usuario.estado
                                ? "Desactivar"
                                : "Activar"}
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

        {/* =========================
            SERVICIOS
        ========================= */}

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
                  Administra los servicios ofrecidos por Turismo
                  Colombia.
                </p>

              </div>

              <button
                onClick={abrirCrearServicio}
                className="rounded-xl bg-[#087f8c] px-5 py-3 font-bold text-white shadow hover:bg-[#006b75]"
              >
                + Crear servicio
              </button>

            </div>

            {/* Cargando */}
            {cargandoServicios && (
              <div className="mt-8 rounded-xl bg-[#f8f6ef] p-8 text-center">

                <p className="font-semibold text-[#087f8c]">
                  Cargando servicios...
                </p>

              </div>
            )}

            {/* Error */}
            {!cargandoServicios && errorServicios && (
              <div className="mt-8 rounded-xl bg-red-50 p-6 text-center">

                <p className="font-semibold text-red-600">
                  {errorServicios}
                </p>

              </div>
            )}

            {/* Tabla */}
            {!cargandoServicios && !errorServicios && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100">

                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead className="bg-[#004f54] text-white">

                      <tr>
                        <th className="px-5 py-4">ID</th>
                        <th className="px-5 py-4">Servicio</th>
                        <th className="px-5 py-4">Descripción</th>
                        <th className="px-5 py-4">Categoría</th>
                        <th className="px-5 py-4">Duración</th>
                        <th className="px-5 py-4">Ubicación</th>
                        <th className="px-5 py-4">Cupo</th>
                        <th className="px-5 py-4">Precio</th>
                        <th className="px-5 py-4">Estado</th>
                        <th className="px-5 py-4">Acciones</th>
                      </tr>

                    </thead>

                    <tbody>

                      {servicios.length === 0 ? (
                        <tr>

                          <td
                            colSpan="10"
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

                            <td className="px-5 py-4 text-gray-600">
                              {servicio.categoria || "—"}
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {servicio.duracion || "—"}
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {servicio.ubicacion || "—"}
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {servicio.cupo_maximo
                                ? `${servicio.cupo_maximo} personas`
                                : "—"}
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

                                <button
                                  onClick={() => cambiarEstadoServicio(servicio.id_servicio, servicio.estado)}
                                  className={`rounded-lg px-3 py-2 text-sm font-bold text-white ${
                                    servicio.estado
                                      ? "bg-red-500 hover:bg-red-600"
                                      : "bg-green-500 hover:bg-green-600"
                                  }`}
                                >
                                  {servicio.estado ? "Desactivar" : "Activar"}
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

        {/* =========================
            PERFIL
        ========================= */}

        {seccion === "perfil" && (
          <EditarPerfil
            onCerrar={() => setSeccion("resumen")}
          />
        )}

        {/* =========================
            MODAL USUARIO
        ========================= */}

        {mostrarModal && (
          <UsuarioModal
            usuario={usuarioEditar}
            onClose={() => {
              setMostrarModal(false);
              setUsuarioEditar(null);
            }}
            onGuardar={guardarUsuario}
          />
        )}

        {/* =========================
            MODAL SERVICIO
        ========================= */}

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

export default PanelAdministrador;