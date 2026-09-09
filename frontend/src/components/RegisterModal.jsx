
import { apiFetch } from "../services/api";
import { useState } from "react";
import toast from "react-hot-toast";

function RegisterModal({ onClose }) {
  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    documento: "",
    direccion: "",
    telefono: "",
    correo: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [errores, setErrores] = useState({});

  const validarCampo = (name, value, datosActuales = formulario) => {
    let mensaje = "";

    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const soloNumeros = /^\d+$/;
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value.trim()) {
      mensaje = "Este campo es obligatorio.";
    }

    if (!mensaje && (name === "nombre" || name === "apellido")) {
      if (!soloLetras.test(value)) {
        mensaje = "Solo se permiten letras.";
      } else if (value.trim().length < 2) {
        mensaje = "Debe tener mínimo 2 caracteres.";
      } else if (value.trim().length > 30) {
        mensaje = "No puede superar los 30 caracteres.";
      }
    }

    if (!mensaje && name === "tipoDocumento") {
      if (!["CC", "TI", "CE"].includes(value)) {
        mensaje = "Selecciona un tipo de documento válido.";
      }
    }

    if (!mensaje && name === "documento") {
      if (!soloNumeros.test(value)) {
        mensaje = "El documento solo puede contener números.";
      } else if (value.length < 6 || value.length > 12) {
        mensaje = "Debe tener entre 6 y 12 números.";
      }
    }

    if (!mensaje && name === "direccion") {
      if (value.length < 5) {
        mensaje = "La dirección debe tener mínimo 5 caracteres.";
      } else if (value.length > 100) {
        mensaje = "La dirección no puede superar los 100 caracteres.";
      }
    }

    if (!mensaje && name === "telefono") {
      if (!soloNumeros.test(value)) {
        mensaje = "El teléfono solo puede contener números.";
      } else if (value.length < 7 || value.length > 10) {
        mensaje = "Debe tener entre 7 y 10 números.";
      }
    }

    if (!mensaje && name === "correo") {
      if (!correoValido.test(value)) {
        mensaje = "Ingresa un correo electrónico válido.";
      } else if (value.length > 100) {
        mensaje = "El correo no puede superar los 100 caracteres.";
      }
    }

    if (!mensaje && name === "contrasena") {
      if (value.length < 8) {
        mensaje = "La contraseña debe tener mínimo 8 caracteres.";
      } else if (value.length > 10) {
        mensaje = "La contraseña no puede superar los 10 caracteres.";
      } else if (!/[A-Z]/.test(value)) {
        mensaje = "Debe contener al menos una letra mayúscula.";
      } else if (!/[a-z]/.test(value)) {
        mensaje = "Debe contener al menos una letra minúscula.";
      } else if (!/\d/.test(value)) {
        mensaje = "Debe contener al menos un número.";
      }
    }

    if (!mensaje && name === "confirmarContrasena") {
      if (value !== datosActuales.contrasena) {
        mensaje = "Las contraseñas no coinciden.";
      }
    }

    setErrores((prev) => ({
      ...prev,
      [name]: mensaje,
    }));

    return mensaje;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const nuevoFormulario = {
      ...formulario,
      [name]: value,
    };

    setFormulario(nuevoFormulario);

    validarCampo(name, value, nuevoFormulario);

    if (name === "contrasena" && formulario.confirmarContrasena) {
      validarCampo(
        "confirmarContrasena",
        formulario.confirmarContrasena,
        nuevoFormulario
      );
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    Object.entries(formulario).forEach(([name, value]) => {
      const error = validarCampo(name, value, formulario);

      if (error) {
        nuevosErrores[name] = error;
      }
    });

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validarFormulario()) {
    return;
  }
  
   console.log("Errores actuales:", errores);
  try {
    await apiFetch("/api/usuarios/registro", {
      method: "POST",
      body: JSON.stringify({
        nombre: formulario.nombre,
        apellido: formulario.apellido,
        tipo_documento: formulario.tipoDocumento,
        numero_documento: formulario.documento,
        direccion: formulario.direccion,
        telefono: formulario.telefono,
        correo: formulario.correo,
        contrasena: formulario.contrasena,
      }),
    });

    toast.success("Registro exitoso. Ahora puedes iniciar sesión.");
    onClose();
  } catch (error) {
    console.error("Error al registrarse:", error);
    toast.error(error.message || "Ocurrió un error al registrarse.");
  }
};
  const campo = (
    nombre,
    etiqueta,
    tipo = "text",
    placeholder = "",
    maxLength
  ) => (
    <div>
      <label
        htmlFor={nombre}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {etiqueta}
      </label>

      <input
        id={nombre}
        name={nombre}
        type={tipo}
        value={formulario[nombre]}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
          errores[nombre]
            ? "border-red-400 focus:ring-red-200"
            : "border-gray-300 focus:border-[#087f8c] focus:ring-[#087f8c]/20"
        }`}
      />

      {errores[nombre] && (
        <p className="mt-1 text-sm text-red-500">
          {errores[nombre]}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-10">

        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-600 transition hover:bg-red-100 hover:text-red-500"
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="mb-8 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.25em] text-[#f4b942]">
            Crear cuenta
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-[#087f8c]">
            Registro de cliente
          </h2>

          <p className="mt-2 text-gray-500">
            Completa tus datos para crear tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {campo(
              "nombre",
              "Nombre",
              "text",
              "Tu nombre",
              50
            )}

            {campo(
              "apellido",
              "Apellido",
              "text",
              "Tu apellido",
              50
            )}

            <div>
              <label
                htmlFor="tipoDocumento"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Tipo de documento
              </label>

              <select
                id="tipoDocumento"
                name="tipoDocumento"
                value={formulario.tipoDocumento}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                  errores.tipoDocumento
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-300 focus:border-[#087f8c] focus:ring-[#087f8c]/20"
                }`}
              >
                <option value="">Selecciona una opción</option>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="CE">Cédula de extranjería</option>
              </select>

              {errores.tipoDocumento && (
                <p className="mt-1 text-sm text-red-500">
                  {errores.tipoDocumento}
                </p>
              )}
            </div>

            {campo(
              "documento",
              "Número de documento",
              "text",
              "Número de documento",
              10
            )}

            {campo(
              "direccion",
              "Dirección",
              "text",
              "Dirección de residencia",
              100
            )}

            {campo(
              "telefono",
              "Teléfono",
              "tel",
              "Número de teléfono",
              10
            )}

            {campo(
              "correo",
              "Correo electrónico",
              "email",
              "correo@ejemplo.com",
              100
            )}

            {campo(
              "contrasena",
              "Contraseña",
              "password",
              "Mínimo 8 caracteres",
              30
            )}

            {campo(
              "confirmarContrasena",
              "Confirmación de contraseña",
              "password",
              "Repite tu contraseña",
              30
            )}

          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-6 py-3 font-bold text-gray-600 transition hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#087f8c] px-8 py-3 font-bold text-white transition hover:bg-[#006b75] hover:shadow-lg"
            >
              Registrarme
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}

export default RegisterModal;