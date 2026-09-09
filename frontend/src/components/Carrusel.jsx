import { useState } from "react";

import cartagena from "../assets/images/cartagena.jpg";
import ejeCafetero from "../assets/images/eje-cafetero.jpg";
import guatape from "../assets/images/guatape.jpg";
import islaRosario from "../assets/images/isla-rosario.jpg";
import medellin from "../assets/images/medellin.jpg";
import salento from "../assets/images/salento.jpg";
import sanAndres from "../assets/images/san-andres.jpg";
import tayrona from "../assets/images/tayrona.jpg";
import valleCocora from "../assets/images/valle-cocora.jpg";
import villaLeyva from "../assets/images/villa-leyva.jpg";

const destinos = [
  {
    imagen: cartagena,
    titulo: "Cartagena de Indias",
    descripcion:
      "Descubre la ciudad amurallada, sus calles coloniales y la belleza del Caribe colombiano.",
  },
  {
    imagen: guatape,
    titulo: "Guatapé",
    descripcion:
      "Disfruta de sus coloridas calles, la Piedra del Peñol y sus hermosos paisajes.",
  },
  {
    imagen: sanAndres,
    titulo: "San Andrés",
    descripcion:
      "Conoce sus playas de aguas cristalinas y disfruta del hermoso mar de siete colores.",
  },
  {
    imagen: tayrona,
    titulo: "Parque Tayrona",
    descripcion:
      "Explora la naturaleza, las playas y los paisajes de uno de los parques más visitados de Colombia.",
  },
  {
    imagen: ejeCafetero,
    titulo: "Eje Cafetero",
    descripcion:
      "Descubre las montañas cafeteras y conoce la cultura que rodea al café colombiano.",
  },
  {
    imagen: medellin,
    titulo: "Medellín",
    descripcion:
      "Conoce la ciudad de la eterna primavera, sus espacios culturales y sus hermosos paisajes.",
  },
  {
    imagen: villaLeyva,
    titulo: "Villa de Leyva",
    descripcion:
      "Recorre sus calles coloniales y disfruta de una de las plazas más famosas de Colombia.",
  },
  {
    imagen: islaRosario,
    titulo: "Islas del Rosario",
    descripcion:
      "Relájate en sus playas y disfruta de la biodiversidad marina del Caribe colombiano.",
  },
  {
    imagen: salento,
    titulo: "Salento",
    descripcion:
      "Visita este hermoso municipio cafetero y descubre sus paisajes y arquitectura tradicional.",
  },
  {
    imagen: valleCocora,
    titulo: "Valle de Cocora",
    descripcion:
      "Admira las impresionantes palmas de cera y los paisajes naturales del Quindío.",
  },
];

function Carrusel() {
  const [indice, setIndice] = useState(0);

  const siguiente = () => {
    setIndice((indice + 1) % destinos.length);
  };

  const anterior = () => {
    setIndice(
      (indice - 1 + destinos.length) % destinos.length
    );
  };

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <div className="relative h-[320px] w-full overflow-hidden rounded-3xl shadow-xl md:h-[480px]">

        {/* IMAGEN */}
        <img
          src={destinos[indice].imagen}
          alt={destinos[indice].titulo}
          className="h-full w-full object-cover transition-opacity duration-500"
        />

        {/* OVERLAY DEGRADADO */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* TEXTO */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <h2 className="text-2xl font-extrabold text-white drop-shadow md:text-4xl">
            {destinos[indice].titulo}
          </h2>

          <p className="mt-2 max-w-xl text-sm text-white/90 drop-shadow md:text-base">
            {destinos[indice].descripcion}
          </p>
        </div>

        {/* FLECHA ANTERIOR */}
        <button
          onClick={anterior}
          aria-label="Destino anterior"
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xl font-bold text-[#087f8c] shadow-md backdrop-blur transition hover:bg-white hover:scale-105 md:left-5"
        >
          ←
        </button>

        {/* FLECHA SIGUIENTE */}
        <button
          onClick={siguiente}
          aria-label="Destino siguiente"
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xl font-bold text-[#087f8c] shadow-md backdrop-blur transition hover:bg-white hover:scale-105 md:right-5"
        >
          →
        </button>

        {/* INDICADORES */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-6">
          {destinos.map((destino, posicion) => (
            <button
              key={destino.titulo}
              onClick={() => setIndice(posicion)}
              aria-label={`Mostrar ${destino.titulo}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                posicion === indice
                  ? "w-7 bg-[#f4b942]"
                  : "w-2.5 bg-white/60 hover:bg-white/90"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default Carrusel;