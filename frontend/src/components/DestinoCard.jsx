// src/components/DestinoCard.jsx

import { useState } from "react";

function DestinoCard({
  imagen,
  imagenModal,
  titulo,
  descripcion,
  descripcionModal,
}) {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <>
      <article className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
        <div className="h-64 overflow-hidden">
          <img
            src={imagen}
            alt={titulo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        </div>

        <div className="p-6">
          <h2 className="mb-3 text-2xl font-bold text-[#087f8c]">
            {titulo}
          </h2>

          <p className="leading-relaxed text-gray-600">
            {descripcion}
          </p>

          <button
            onClick={() => setMostrarModal(true)}
            className="mt-5 rounded-full bg-[#087f8c] px-5 py-2.5 font-bold text-white transition duration-300 hover:bg-[#066b75]"
          >
            Conocer más
          </button>
        </div>
      </article>

      {mostrarModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid max-h-[90vh] overflow-y-auto md:grid-cols-2">
              
              <div className="h-72 md:h-full md:min-h-[500px]">
                <img
                  src={imagenModal}
                  alt={`Paisaje de ${titulo}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-center p-8 md:p-10">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-[#f4b942]">
                  Descubre este destino
                </p>

                <h2 className="mb-5 text-3xl font-extrabold text-[#087f8c] md:text-4xl">
                  {titulo}
                </h2>

                <p className="text-base leading-8 text-gray-600 md:text-lg">
                  {descripcionModal}
                </p>

                <button
                  onClick={() => setMostrarModal(false)}
                  className="mt-8 w-fit rounded-full bg-[#087f8c] px-7 py-3 font-bold text-white transition duration-300 hover:bg-[#066b75]"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DestinoCard;