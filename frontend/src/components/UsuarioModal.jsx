import { useEffect, useState } from "react";

function UsuarioModal({ usuario, onClose, onGuardar }) {
  const formularioInicial = {
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    documento: "",
    direccion: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
    id_rol: 3,
  };

  const [formulario, setFormulario] = useState(formularioInicial);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    if (usuario) {
      setFormulario({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        tipoDocumento: usuario.tipo_documento || "",
        documento: usuario.numero_documento || "",
        direccion: usuario.direccion || "",
        telefono: usuario.telefono || "",
        correo: usuario.correo || "",
        contrasena: "",
        confirmarContrasena: "",
        id_rol: usuario.id_rol || 3,
      });
    } else {
      setFormulario(formularioInicial);
    }

    setErrores({});
  }, [usuario]);

  const validarCampo = (
    name,
    value,
    formularioActual = formulario
  ) => {
    let mensajeError = "";

    if (name === "nombre") {
      if (!value.trim()) {
        mensajeError = "El nombre es obligatorio.";
      } else if (
        !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)
      ) {
        mensajeError = "Solo se permiten letras.";
      } else if (value.trim().length < 2) {
        mensajeError = "Debe tener mínimo 2 caracteres.";
      } else if (value.trim().length > 50) {
        mensajeError = "No puede superar 50 caracteres.";
      }
    }

    if (name === "apellido") {
      if (!value.trim()) {
        mensajeError = "El apellido es obligatorio.";
      } else if (
        !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value)
      ) {
        mensajeError = "Solo se permiten letras.";
      } else if (value.trim().length < 2) {
        mensajeError = "Debe tener mínimo 2 caracteres.";
      } else if (value.trim().length > 50) {
        mensajeError = "No puede superar 50 caracteres.";
      }
    }

    if (name === "tipoDocumento") {
      if (!value) {
        mensajeError = "Selecciona un tipo de documento.";
      }
    }

    if (name === "documento") {
      if (!value) {
        mensajeError = "El documento es obligatorio.";
      } else if (!/^\d+$/.test(value)) {
        mensajeError = "Solo se permiten números.";
      } else if (value.length < 6) {
        mensajeError = "Debe tener mínimo 6 números.";
      } else if (value.length > 10) {
        mensajeError = "No puede superar 10 números.";
      }
    }

    if (name === "direccion") {
      if (!value.trim()) {
        mensajeError = "La dirección es obligatoria.";
      } else if (value.trim().length < 5) {
        mensajeError = "La dirección debe tener mínimo 5 caracteres.";
      } else if (value.length > 150) {
        mensajeError = "La dirección no puede superar 150 caracteres.";
      }
    }

    if (name === "telefono") {
      if (!value) {
        mensajeError = "El teléfono es obligatorio.";
      } else if (!/^\d+$/.test(value)) {
        mensajeError = "El teléfono solo puede contener números.";
      } else if (value.length < 7) {
        mensajeError = "El teléfono debe tener mínimo 7 números.";
      } else if (value.length > 10) {
        mensajeError = "El teléfono no puede superar 10 números.";
      }
    }

     if (name === "correo") {
        if (!value.trim()) {
            mensajeError = "El correo es obligatorio.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
            mensajeError = "Ingresa un correo válido.";
        } else if (value.length > 100) {
            mensajeError = "No puede superar 100 caracteres.";
        }
    }

    if (name === "contrasena") {
      // En edición la contraseña puede quedar vacía.
      if (!usuario && !value) {
        mensajeError = "La contraseña es obligatoria.";
      }

      if (value) {
        if (value.length < 8) {
          mensajeError =
            "La contraseña debe tener mínimo 8 caracteres.";
        } else if (value.length > 50) {
          mensajeError =
            "La contraseña no puede superar 50 caracteres.";
        } else if (!/[A-Z]/.test(value)) {
          mensajeError =
            "Debe contener al menos una mayúscula.";
        } else if (!/[a-z]/.test(value)) {
          mensajeError =
            "Debe contener al menos una minúscula.";
        } else if (!/[0-9]/.test(value)) {
          mensajeError =
            "Debe contener al menos un número.";
        }
      }
    }

    if (name === "confirmarContrasena") {
      if (!usuario && !value) {
        mensajeError =
          "Debes confirmar la contraseña.";
      } else if (
        formularioActual.contrasena &&
        value !== formularioActual.contrasena
      ) {
        mensajeError =
          "Las contraseñas no coinciden.";
      }
    }

    return mensajeError;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const nuevoFormulario = {
      ...formulario,
      [name]: value,
    };

    setFormulario(nuevoFormulario);

    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: validarCampo(
        name,
        value,
        nuevoFormulario
      ),
    }));

    // Si cambia la contraseña, validar también su confirmación.
    if (name === "contrasena") {
      setErrores((erroresActuales) => ({
        ...erroresActuales,
        contrasena: validarCampo(
          "contrasena",
          value,
          nuevoFormulario
        ),
        confirmarContrasena: validarCampo(
          "confirmarContrasena",
          nuevoFormulario.confirmarContrasena,
          nuevoFormulario
        ),
      }));
    }
  };

  const validarFormularioCompleto = () => {
    const nuevosErrores = {};

    Object.keys(formulario).forEach((campo) => {
      if (
        campo === "confirmarContrasena" &&
        usuario
      ) {
        return;
      }

      if (campo === "contrasena" && usuario) {
        if (!formulario.contrasena) {
          return;
        }
      }

      const errorCampo = validarCampo(
        campo,
        formulario[campo],
        formulario
      );

      if (errorCampo) {
        nuevosErrores[campo] = errorCampo;
      }
    });

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarFormularioCompleto()) {
      return;
    }

    // No enviamos confirmarContrasena al backend.
    const datosParaEnviar = {
      nombre: formulario.nombre,
      apellido: formulario.apellido,
      tipoDocumento: formulario.tipoDocumento,
      documento: formulario.documento,
      direccion: formulario.direccion,
      telefono: formulario.telefono,
      correo: formulario.correo,
      contrasena: formulario.contrasena,
      id_rol: Number(formulario.id_rol),
    };

    console.log("DATOS QUE SE VAN A ENVIAR:", datosParaEnviar);

    onGuardar(datosParaEnviar);
  };

  const hayErrores = Object.values(errores).some(
    (errorCampo) => errorCampo
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">

      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">

        {/* CERRAR */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-600 hover:bg-red-100 hover:text-red-500"
        >
          ×
        </button>

        {/* TITULO */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
            Administración
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-[#087f8c]">
            {usuario
              ? "Editar usuario"
              : "Agregar usuario"}
          </h2>

          <p className="mt-2 text-gray-500">
            {usuario
              ? "Modifica la información del usuario."
              : "Completa los datos para registrar un nuevo usuario."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* NOMBRE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nombre
              </label>

              <input
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                required
                maxLength={50}
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  errores.nombre
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#087f8c]"
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
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Apellido
              </label>

              <input
                name="apellido"
                value={formulario.apellido}
                onChange={handleChange}
                required
                maxLength={50}
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  errores.apellido
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
              />

              {errores.apellido && (
                <p className="mt-1 text-sm text-red-500">
                  {errores.apellido}
                </p>
              )}
            </div>

            {/* TIPO DOCUMENTO */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Tipo de documento
              </label>

              <select
                name="tipoDocumento"
                value={formulario.tipoDocumento}
                onChange={handleChange}
                required
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  errores.tipoDocumento
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
              >
                <option value="">
                  Seleccionar
                </option>

                <option value="CC">
                  Cédula de ciudadanía
                </option>

                <option value="TI">
                  Tarjeta de identidad
                </option>

                <option value="CE">
                  Cédula de extranjería
                </option>
              </select>

              {errores.tipoDocumento && (
                <p className="mt-1 text-sm text-red-500">
                  {errores.tipoDocumento}
                </p>
              )}
            </div>

            {/* DOCUMENTO */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Número de documento
              </label>

              <input
                name="documento"
                value={formulario.documento}
                onChange={handleChange}
                required
                inputMode="numeric"
                maxLength={10}
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  errores.documento
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
              />

              {errores.documento && (
                <p className="mt-1 text-sm text-red-500">
                  {errores.documento}
                </p>
              )}
            </div>

            {/* DIRECCIÓN */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Dirección
              </label>

              <input
                name="direccion"
                value={formulario.direccion}
                onChange={handleChange}
                required
                maxLength={150}
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  errores.direccion
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
              />

              {errores.direccion && (
                <p className="mt-1 text-sm text-red-500">
                  {errores.direccion}
                </p>
              )}
            </div>

            {/* TELÉFONO */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Teléfono
              </label>

              <input
                name="telefono"
                value={formulario.telefono}
                onChange={handleChange}
                required
                inputMode="numeric"
                maxLength={10}
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  errores.telefono
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
              />

              {errores.telefono && (
                <p className="mt-1 text-sm text-red-500">
                  {errores.telefono}
                </p>
              )}
            </div>

            {/* CORREO */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Correo electrónico
              </label>

              <input
                type="email"
                name="correo"
                value={formulario.correo}
                onChange={handleChange}
                required
                maxLength={100}
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  errores.correo
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
              />

              {errores.correo && (
                <p className="mt-1 text-sm text-red-500">
                  {errores.correo}
                </p>
              )}
            </div>

            {/* CONTRASEÑA */}
            {!usuario && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>

                <input
                  type="password"
                  name="contrasena"
                  value={formulario.contrasena}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${
                    errores.contrasena
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#087f8c]"
                  }`}
                />

                {errores.contrasena && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.contrasena}
                  </p>
                )}
              </div>
            )}

            {/* CONFIRMAR CONTRASEÑA */}
            {!usuario && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Confirmar contraseña
                </label>

                <input
                  type="password"
                  name="confirmarContrasena"
                  value={formulario.confirmarContrasena}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  placeholder="Repite la contraseña"
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${
                    errores.confirmarContrasena
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#087f8c]"
                  }`}
                />

                {errores.confirmarContrasena && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.confirmarContrasena}
                  </p>
                )}
              </div>
            )}

            {/* ROL */}
            <div
              className={
                !usuario
                  ? ""
                  : "md:col-span-2"
              }
            >
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Rol
              </label>

              <select
                name="id_rol"
                value={formulario.id_rol}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#087f8c]"
              >
                <option value={1}>
                  Administrador
                </option>

                <option value={2}>
                  Empleado
                </option>

                <option value={3}>
                  Cliente
                </option>
              </select>
            </div>

          </div>

          {/* BOTONES */}
          <div className="mt-8 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-6 py-3 font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={hayErrores}
              className={`rounded-xl px-6 py-3 font-bold text-white shadow ${
                hayErrores
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[#087f8c] hover:bg-[#006b75]"
              }`}
            >
              {usuario
                ? "Guardar cambios"
                : "Agregar usuario"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default UsuarioModal;
