import { useEffect, useState } from "react";

import colombiaTurismo from "../assets/images/colombia-turismo.jpg";
import cartagena from "../assets/images/cartagena.jpg";
import guatape from "../assets/images/guatape.jpg";

const slides = [
  {
    imagen: colombiaTurismo,
    titulo: "Descubre la magia de Colombia",
    descripcion:
      "Un país lleno de paisajes, cultura, aventura y experiencias inolvidables.",
  },
  {
    imagen: cartagena,
    titulo: "Cartagena de Indias",
    descripcion:
      "Historia, arquitectura colonial y el encanto del Caribe colombiano.",
  },
  {
    imagen: guatape,
    titulo: "Vive Guatapé",
    descripcion:
      "Color, naturaleza y aventura en uno de los destinos más encantadores de Antioquia.",
  },
];

function Hero() {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setActual((anterior) => (anterior + 1) % slides.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const anterior = () => {
    setActual((actual) => (actual - 1 + slides.length) % slides.length);
  };

  const siguiente = () => {
    setActual((actual) => (actual + 1) % slides.length);
  };

  return (
    <section className="relative h-[650px] w-full overflow-hidden">
      {slides.map((slide, indice) => (
        <div
          key={slide.titulo}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            indice === actual ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.imagen}
            alt={slide.titulo}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-[90%] max-w-[1400px] px-4 md:px-10">
              <div className="max-w-2xl text-white">
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#f4b942]">
                  Turismo Colombia
                </p>

                <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-6xl">
                  {slide.titulo}
                </h1>

                <p className="mb-8 max-w-xl text-lg leading-relaxed text-gray-200 md:text-xl">
                  {slide.descripcion}
                </p>

                <a
                  href="#destinos"
                  className="inline-block rounded-full bg-[#f4b942] px-7 py-3 font-bold text-gray-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-white"
                >
                  Explorar destinos
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={anterior}
        className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl text-white backdrop-blur transition hover:bg-white hover:text-[#087f8c]"
        aria-label="Imagen anterior"
      >
        ‹
      </button>

      <button
        onClick={siguiente}
        className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl text-white backdrop-blur transition hover:bg-white hover:text-[#087f8c]"
        aria-label="Imagen siguiente"
      >
        ›
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((slide, indice) => (
          <button
            key={slide.titulo}
            onClick={() => setActual(indice)}
            className={`h-2 rounded-full transition-all duration-300 ${
              indice === actual
                ? "w-8 bg-[#f4b942]"
                : "w-2 bg-white/70 hover:bg-white"
            }`}
            aria-label={`Ir a la imagen ${indice + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;