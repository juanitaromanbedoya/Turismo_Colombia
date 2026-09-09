import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api"; 

function RecuperarPassword() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => { e.preventDefault();

  setError("");
  setMensaje("");

  if (!correo.trim()) {
    setError("El correo electrónico es obligatorio.");
    return;
  }

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(correo)) {
    setError("Ingresa un correo electrónico válido.");
    return;
  }

  try {
    await apiFetch("/api/auth/recuperar-password", {
      method: "POST",
      body: JSON.stringify({ correo }),
    });

    setMensaje(
      "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña."
    );
  } catch (error) {
    setError(error.message || "Ocurrió un error, intenta de nuevo.");
  }
};

  return (
    <main className="min-h-[calc(100vh-160px)] bg-[#fffaf0] px-4 py-16">

      <section className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-2xl md:p-10">

        <div className="mb-8 text-center">

          <span className="text-sm font-bold uppercase tracking-[0.25em] text-[#f4b942]">
            Recuperación
          </span>

          <h1 className="mt-3 text-3xl font-extrabold text-[#087f8c] md:text-4xl">
            Recuperar contraseña
          </h1>

          <p className="mt-3 leading-relaxed text-gray-500">
            Ingresa tu correo electrónico y te indicaremos cómo recuperar
            el acceso a tu cuenta.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <label
            htmlFor="correo-recuperacion"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Correo electrónico
          </label>

          <input
            id="correo-recuperacion"
            type="email"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              setError("");
              setMensaje("");
            }}
            placeholder="correo@ejemplo.com"
            className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
              error
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:border-[#087f8c] focus:ring-[#087f8c]/20"
            }`}
          />

          {error && (
            <p className="mt-2 text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          {mensaje && (
            <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-[#087f8c] py-3 font-bold text-white transition hover:bg-[#006b75] hover:shadow-lg"
          >
            Recuperar contraseña
          </button>

        </form>

        <div className="mt-6 text-center">

          <Link
            to="/login"
            className="font-semibold text-[#087f8c] transition hover:text-[#f4b942]"
          >
            ← Volver a iniciar sesión
          </Link>

        </div>

      </section>

    </main>
  );
}

export default RecuperarPassword;