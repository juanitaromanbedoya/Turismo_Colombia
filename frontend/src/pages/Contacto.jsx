// src/pages/Contacto.jsx

import { useState } from "react";

function Contacto() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    mensaje: "",
  });

  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  const validarCampo = (nombre, valor) => {
    let mensaje = "";

    if (!valor.trim()) {
      mensaje = "Este campo es obligatorio.";
    }

    if (nombre === "nombre" && valor.trim()) {
      if (valor.trim().length < 3) {
        mensaje = "El nombre debe tener mínimo 3 caracteres.";
      }
    }

    if (nombre === "correo" && valor.trim()) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!regex.test(valor)) {
        mensaje = "Ingresa un correo electrónico válido.";
      }
    }

    if (nombre === "mensaje" && valor.trim()) {
      if (valor.trim().length < 10) {
        mensaje = "El mensaje debe tener mínimo 10 caracteres.";
      }
    }

    setErrores((prev) => ({
      ...prev,
      [nombre]: mensaje,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    validarCampo(name, value);

    setEnviado(false);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    } else if (formulario.nombre.trim().length < 3) {
      nuevosErrores.nombre =
        "El nombre debe tener mínimo 3 caracteres.";
    }

    if (!formulario.correo.trim()) {
      nuevosErrores.correo =
        "El correo electrónico es obligatorio.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.correo)
    ) {
      nuevosErrores.correo =
        "Ingresa un correo electrónico válido.";
    }

    if (!formulario.mensaje.trim()) {
      nuevosErrores.mensaje = "El mensaje es obligatorio.";
    } else if (formulario.mensaje.trim().length < 10) {
      nuevosErrores.mensaje =
        "El mensaje debe tener mínimo 10 caracteres.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setEnviado(true);

    setFormulario({
      nombre: "",
      correo: "",
      mensaje: "",
    });

    setErrores({});
  };

  return (
    <main className="bg-[#f8f6ef]">

      {/* HERO */}
      <section className="bg-[#004f54] px-6 py-20 text-center text-white">

        <span className="text-sm font-bold uppercase tracking-[0.3em] text-[#f4b942]">
          Estamos para ayudarte
        </span>

        <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
          Contáctanos
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
          ¿Tienes alguna pregunta, sugerencia o quieres conocer más sobre
          Colombia? Escríbenos y estaremos encantados de ayudarte.
        </p>

      </section>

      {/* INFORMACIÓN + FORMULARIO */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-10 lg:grid-cols-3">

          {/* INFORMACIÓN */}
          <div className="space-y-6">

            <div>
              <span className="text-sm font-bold uppercase tracking-[0.25em] text-[#f4b942]">
                Ponte en contacto
              </span>

              <h2 className="mt-3 text-3xl font-extrabold text-[#087f8c]">
                Hablemos
              </h2>

              <p className="mt-4 leading-relaxed text-gray-600">
                Estamos aquí para resolver tus dudas y ayudarte a descubrir
                nuevos destinos turísticos en Colombia.
              </p>
            </div>

            {/* CORREO */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#087f8c] text-xl text-white">
                  ✉️
                </div>

                <div>
                  <h3 className="font-bold text-[#087f8c]">
                    Correo electrónico
                  </h3>

                  <p className="mt-1 text-gray-600">
                    contacto@turismocolombia.com
                  </p>
                </div>

              </div>
            </div>

            {/* TELÉFONO */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f4b942] text-xl">
                  📞
                </div>

                <div>
                  <h3 className="font-bold text-[#087f8c]">
                    Teléfono
                  </h3>

                  <p className="mt-1 text-gray-600">
                    +57 300 000 0000
                  </p>
                </div>

              </div>
            </div>

            {/* UBICACIÓN */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#087f8c] text-xl text-white">
                  📍
                </div>

                <div>
                  <h3 className="font-bold text-[#087f8c]">
                    Ubicación
                  </h3>

                  <p className="mt-1 text-gray-600">
                    Colombia
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* FORMULARIO */}
          <div className="lg:col-span-2">

            <div className="rounded-3xl bg-white p-8 shadow-xl md:p-10">

              <div className="mb-8">

                <h2 className="text-3xl font-extrabold text-[#087f8c]">
                  Envíanos un mensaje
                </h2>

                <p className="mt-2 text-gray-500">
                  Completa el formulario y nos pondremos en contacto contigo.
                </p>

              </div>

              {/* MENSAJE DE ÉXITO */}
              {enviado && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                  <p className="font-bold">
                    ¡Mensaje enviado correctamente!
                  </p>

                  <p className="mt-1 text-sm">
                    Gracias por contactarnos. Revisaremos tu mensaje y
                    pronto estaremos en contacto contigo.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* NOMBRE */}
                <div className="mb-5">

                  <label
                    htmlFor="nombre"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Nombre
                  </label>

                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formulario.nombre}
                    onChange={handleChange}
                    placeholder="Escribe tu nombre"
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                      errores.nombre
                        ? "border-red-400 focus:ring-red-200"
                        : "border-gray-300 focus:border-[#087f8c] focus:ring-[#087f8c]/20"
                    }`}
                  />

                  {errores.nombre && (
                    <p className="mt-2 text-sm text-red-500">
                      {errores.nombre}
                    </p>
                  )}

                </div>

                {/* CORREO */}
                <div className="mb-5">

                  <label
                    htmlFor="correo"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    value={formulario.correo}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                      errores.correo
                        ? "border-red-400 focus:ring-red-200"
                        : "border-gray-300 focus:border-[#087f8c] focus:ring-[#087f8c]/20"
                    }`}
                  />

                  {errores.correo && (
                    <p className="mt-2 text-sm text-red-500">
                      {errores.correo}
                    </p>
                  )}

                </div>

                {/* MENSAJE */}
                <div className="mb-6">

                  <label
                    htmlFor="mensaje"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Mensaje
                  </label>

                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows="6"
                    value={formulario.mensaje}
                    onChange={handleChange}
                    placeholder="Escribe tu mensaje..."
                    className={`w-full resize-none rounded-xl border px-4 py-3 outline-none transition focus:ring-2 ${
                      errores.mensaje
                        ? "border-red-400 focus:ring-red-200"
                        : "border-gray-300 focus:border-[#087f8c] focus:ring-[#087f8c]/20"
                    }`}
                  />

                  {errores.mensaje && (
                    <p className="mt-2 text-sm text-red-500">
                      {errores.mensaje}
                    </p>
                  )}

                </div>

                {/* BOTÓN */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#087f8c] py-3 font-bold text-white transition hover:bg-[#006b75] hover:shadow-lg"
                >
                  Enviar mensaje
                </button>

              </form>

            </div>

          </div>

        </div>

      </section>

      {/* SECCIÓN FINAL */}
      <section className="bg-white px-6 py-14 text-center">

        <h2 className="text-3xl font-extrabold text-[#087f8c]">
          Queremos conocer tu opinión
        </h2>

        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-gray-600">
          Tus preguntas, comentarios y sugerencias nos ayudan a mejorar
          continuamente la experiencia de Turismo Colombia.
        </p>

      </section>

    </main>
  );
}

export default Contacto;