import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../services/api";

function RestablecerPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formulario, setFormulario] = useState({
    contrasena: "",
    confirmarContrasena: "",
  });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const validarCampo = (name, value, datosActuales = formulario) => {
    let mensaje = "";

    if (!value) {
      mensaje = "Este campo es obligatorio.";
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

    setErrores((prev) => ({ ...prev, [name]: mensaje }));
    return mensaje;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevoFormulario = { ...formulario, [name]: value };
    setFormulario(nuevoFormulario);
    validarCampo(name, value, nuevoFormulario);

    if (name === "contrasena" && formulario.confirmarContrasena) {
      validarCampo("confirmarContrasena", formulario.confirmarContrasena, nuevoFormulario);
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    Object.entries(formulario).forEach(([name, value]) => {
      const error = validarCampo(name, value, formulario);
      if (error) nuevosErrores[name] = error;
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Enlace inválido. Solicita uno nuevo.");
      return;
    }

    if (!validarFormulario()) return;

    try {
      setCargando(true);
      await apiFetch("/api/auth/restablecer-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          nueva_contrasena: formulario.contrasena,
        }),
      });

      toast.success("Contraseña actualizada correctamente.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "El enlace no es válido o ha expirado.");
    } finally {
      setCargando(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-[#fffaf0] px-4">
        <div className="rounded-3xl bg-white p-10 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-red-500">Enlace inválido</h1>
          <p className="mt-3 text-gray-600">
            Este enlace de recuperación no es válido. Solicita uno nuevo.
          </p>
          <Link
            to="/recuperar-password"
            className="mt-6 inline-block rounded-xl bg-[#087f8c] px-6 py-3 font-bold text-white hover:bg-[#006b75]"
          >
            Solicitar de nuevo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-160px)] bg-[#fffaf0] px-4 py-16">
      <section className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-2xl md:p-10">
        <div className="mb-8 text-center">
          <span className="text-sm font-bold uppercase tracking-[0.25em] text-[#f4b942]">
            Nueva contraseña
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#087f8c] md:text-4xl">
            Restablecer contraseña
          </h1>
          <p className="mt-3 leading-relaxed text-gray-500">
            Escribe tu nueva contraseña para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Nueva contraseña
          </label>
          <input
            name="contrasena"
            type="password"
            value={formulario.contrasena}
            onChange={handleChange}
            placeholder="Entre 8 y 10 caracteres"
            maxLength={10}
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
              errores.contrasena
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:border-[#087f8c] focus:ring-[#087f8c]/20"
            }`}
          />
          {errores.contrasena && (
            <p className="mt-1 text-sm text-red-500">{errores.contrasena}</p>
          )}

          <label className="mb-2 mt-4 block text-sm font-semibold text-gray-700">
            Confirmar contraseña
          </label>
          <input
            name="confirmarContrasena"
            type="password"
            value={formulario.confirmarContrasena}
            onChange={handleChange}
            placeholder="Repite tu nueva contraseña"
            maxLength={10}
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
              errores.confirmarContrasena
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:border-[#087f8c] focus:ring-[#087f8c]/20"
            }`}
          />
          {errores.confirmarContrasena && (
            <p className="mt-1 text-sm text-red-500">{errores.confirmarContrasena}</p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="mt-6 w-full rounded-xl bg-[#087f8c] py-3 font-bold text-white transition hover:bg-[#006b75] hover:shadow-lg disabled:opacity-60"
          >
            {cargando ? "Actualizando..." : "Restablecer contraseña"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default RestablecerPassword;