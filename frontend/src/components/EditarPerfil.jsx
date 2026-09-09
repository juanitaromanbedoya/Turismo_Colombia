import { useEffect, useState } from "react";
function EditarPerfil({ onCerrar }) {
  const [usuario, setUsuario] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [errores, setErrores] = useState({});

  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    numero_documento: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      const datos = JSON.parse(usuarioGuardado);

      setUsuario(datos);

      setFormulario({
        nombre: datos.nombre || "",
        apellido: datos.apellido || "",
        numero_documento: datos.numero_documento || "",
        correo: datos.correo || "",
        contrasena: "",
        confirmarContrasena: "",
      });
    }
  }, []);

  // ================================
  // VALIDACIONES
  // ================================

  const validarCampo = (name, value) => {
    let mensajeError = "";

    if (name === "nombre") {
      if (!value.trim()) {
        mensajeError = "El nombre es obligatorio.";
      } else if (value.length < 2) {
        mensajeError = "El nombre debe tener mínimo 2 caracteres.";
      } else if (value.length > 50) {
        mensajeError = "El nombre no puede superar los 50 caracteres.";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
        mensajeError =
          "El nombre solo puede contener letras y espacios.";
      }
    }

    if (name === "apellido") {
      if (!value.trim()) {
        mensajeError = "El apellido es obligatorio.";
      } else if (value.length < 2) {
        mensajeError = "El apellido debe tener mínimo 2 caracteres.";
      } else if (value.length > 50) {
        mensajeError =
          "El apellido no puede superar los 50 caracteres.";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)) {
        mensajeError =
          "El apellido solo puede contener letras y espacios.";
      }
    }

    if (name === "numero_documento") {
      if (!value.trim()) {
        mensajeError = "El número de documento es obligatorio.";
      } else if (!/^\d+$/.test(value)) {
        mensajeError =
          "El documento solo puede contener números.";
      } else if (value.length < 6) {
        mensajeError =
          "El documento debe tener mínimo 6 números.";
      } else if (value.length > 15) {
        mensajeError =
          "El documento no puede superar los 15 números.";
      }
    }

    if (name === "correo") {
      if (!value.trim()) {
        mensajeError = "El correo es obligatorio.";
      } else if (value.length > 100) {
        mensajeError =
          "El correo no puede superar los 100 caracteres.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        mensajeError = "Ingresa un correo electrónico válido.";
      }
    }

    if (name === "contrasena") {
      // La contraseña puede estar vacía porque es opcional
      // cuando solo se quieren editar los demás datos.
      if (value && value.length < 8) {
        mensajeError =
          "La contraseña debe tener mínimo 8 caracteres.";
      } else if (value && value.length > 50) {
        mensajeError =
          "La contraseña no puede superar los 50 caracteres.";
      } else if (
        value &&
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/.test(value)
      ) {
        mensajeError =
          "La contraseña debe contener letras y números.";
      }
    }

    if (name === "confirmarContrasena") {
      if (
        formulario.contrasena &&
        value !== formulario.contrasena
      ) {
        mensajeError = "Las contraseñas no coinciden.";
      }
    }

    return mensajeError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let valor = value;

    // Limitar documento únicamente a números
    if (name === "numero_documento") {
      valor = value.replace(/\D/g, "").slice(0, 15);
    }

    // Limitar nombre y apellido
    if (name === "nombre" || name === "apellido") {
      valor = value.slice(0, 50);
    }

    // Limitar correo
    if (name === "correo") {
      valor = value.slice(0, 100);
    }

    // Limitar contraseña
    if (
      name === "contrasena" ||
      name === "confirmarContrasena"
    ) {
      valor = value.slice(0, 50);
    }

    const nuevoFormulario = {
      ...formulario,
      [name]: valor,
    };

    setFormulario(nuevoFormulario);

    const mensajeError = validarCampo(name, valor);

    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: mensajeError,
    }));

    // Si cambia la contraseña, volver a validar confirmación
    if (name === "contrasena") {
      const errorConfirmacion =
        nuevoFormulario.confirmarContrasena !== valor
          ? "Las contraseñas no coinciden."
          : "";

      setErrores((erroresActuales) => ({
        ...erroresActuales,
        contrasena: mensajeError,
        confirmarContrasena: errorConfirmacion,
      }));
    }
  };

  const validarFormularioCompleto = () => {
    const nuevosErrores = {};

    Object.keys(formulario).forEach((campo) => {
      const mensajeError = validarCampo(
        campo,
        formulario[campo]
      );

      if (mensajeError) {
        nuevosErrores[campo] = mensajeError;
      }
    });

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarCambios = async (e) => {
    e.preventDefault();

    setMensaje("");
    setError("");

    // Validar antes de enviar al backend
    if (!validarFormularioCompleto()) {
      setError(
        "Corrige los errores del formulario antes de continuar."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Tu sesión ha expirado. Inicia sesión nuevamente.");
      return;
    }

    try {
      // No enviamos confirmarContrasena al backend
      const datosEnviar = {
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        numero_documento: formulario.numero_documento,
        correo: formulario.correo.trim(),
        contrasena: formulario.contrasena,
      };

      const respuesta = await fetch(
        "http://localhost:3000/api/usuarios/perfil",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosEnviar),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(
          datos.mensaje ||
            "No se pudieron actualizar los datos."
        );
        return;
      }

      localStorage.setItem(
        "usuario",
        JSON.stringify(datos.usuario)
      );

      setUsuario(datos.usuario);

      setFormulario({
        nombre: datos.usuario.nombre || "",
        apellido: datos.usuario.apellido || "",
        numero_documento:
          datos.usuario.numero_documento || "",
        correo: datos.usuario.correo || "",
        contrasena: "",
        confirmarContrasena: "",
      });

      setErrores({});
      setMensaje("Datos actualizados correctamente.");

      window.dispatchEvent(
        new Event("usuarioActualizado")
      );
    } catch (error) {
      console.error(error);
      setError("No se pudo conectar con el servidor.");
    }
  };

  if (!usuario) {
    return (
      <p className="text-gray-500">
        Cargando información...
      </p>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">

      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
          Mi perfil
        </p>

        <h2 className="mt-2 text-3xl font-extrabold text-[#087f8c]">
          Editar mis datos
        </h2>

        <p className="mt-2 text-gray-600">
          Actualiza tu información personal.
        </p>
      </div>

      {mensaje && (
        <div className="mb-5 rounded-xl bg-green-100 px-4 py-3 font-semibold text-green-700">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-100 px-4 py-3 font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={guardarCambios}>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* NOMBRE */}
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Nombre
            </label>

            <input
              type="text"
              name="nombre"
              value={formulario.nombre}
              onChange={handleChange}
              maxLength={50}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                errores.nombre
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errores.nombre && (
              <p className="mt-1 text-sm text-red-500">
                {errores.nombre}
              </p>
            )}
          </div>

          {/* APELLIDO */}
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Apellido
            </label>

            <input
              type="text"
              name="apellido"
              value={formulario.apellido}
              onChange={handleChange}
              maxLength={50}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                errores.apellido
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errores.apellido && (
              <p className="mt-1 text-sm text-red-500">
                {errores.apellido}
              </p>
            )}
          </div>

          {/* DOCUMENTO */}
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Documento
            </label>

            <input
              type="text"
              name="numero_documento"
              value={formulario.numero_documento}
              onChange={handleChange}
              maxLength={15}
              inputMode="numeric"
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                errores.numero_documento
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errores.numero_documento && (
              <p className="mt-1 text-sm text-red-500">
                {errores.numero_documento}
              </p>
            )}
          </div>

          {/* CORREO */}
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Correo
            </label>

            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={handleChange}
              maxLength={30}
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                errores.correo
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errores.correo && (
              <p className="mt-1 text-sm text-red-500">
                {errores.correo}
              </p>
            )}
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Nueva contraseña
            </label>

            <input
              type="password"
              name="contrasena"
              value={formulario.contrasena}
              onChange={handleChange}
              maxLength={8}
              placeholder="Déjala vacía si no quieres cambiarla"
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                errores.contrasena
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errores.contrasena ? (
              <p className="mt-1 text-sm text-red-500">
                {errores.contrasena}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres, incluyendo letras y números.
              </p>
            )}
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div>
            <label className="mb-2 block font-semibold text-gray-700">
              Confirmar contraseña
            </label>

            <input
              type="password"
              name="confirmarContrasena"
              value={formulario.confirmarContrasena}
              onChange={handleChange}
              maxLength={50}
              disabled={!formulario.contrasena}
              placeholder="Repite la nueva contraseña"
              className={`w-full rounded-xl border px-4 py-3 outline-none ${
                errores.confirmarContrasena
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errores.confirmarContrasena && (
              <p className="mt-1 text-sm text-red-500">
                {errores.confirmarContrasena}
              </p>
            )}
          </div>

        </div>

        <div className="mt-8 flex flex-wrap gap-3">

          <button
            type="submit"
            disabled={Object.values(errores).some(
              (error) => error
            )}
            className="rounded-xl bg-[#087f8c] px-6 py-3 font-bold text-white shadow hover:bg-[#006b75] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Guardar cambios
          </button>

          {onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-xl border border-gray-300 px-6 py-3 font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
          )}

        </div>

      </form>

    </div>
  );
}

export default EditarPerfil;

