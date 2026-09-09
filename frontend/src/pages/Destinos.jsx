// src/pages/Destinos.jsx

import DestinoCard from "../components/DestinoCard";
import cartagena from "../assets/images/cartagena.jpg";
import ejeCafetero from "../assets/images/eje-cafetero.jpg";
import guatape from "../assets/images/guatape.jpg";
import islaRosario from "../assets/images/isla-rosario.jpg";
import islaRosario2 from "../assets/images/isla_rosario2.jpg";
import medellin from "../assets/images/medellin.jpg";
import medellin2 from "../assets/images/medellin2.jpg";
import salento from "../assets/images/salento.jpg";
import salento2 from "../assets/images/salento2.jpg";
import sanAndres from "../assets/images/san-andres.jpg";  
import tayrona from "../assets/images/tayrona.jpg";
import valleCocora from "../assets/images/valle-cocora.jpg";
import villaLeyva from "../assets/images/villa-leyva.jpg";
import cartagena2 from "../assets/images/cartagena2.jpg";
import guatape2 from "../assets/images/guatape2.jpg";
import tayrona2 from "../assets/images/tayrona2.jpg";
import ejecagetero2 from "../assets/images/eje-cafetero2.jpg";

const destinos = [
  {
    imagen: cartagena,
    imagenModal: cartagena2,
    titulo: "Cartagena de Indias",
    descripcion:
      "Historia, arquitectura colonial y el encanto del Caribe colombiano.",
    descripcionModal:
      "Cartagena de Indias combina historia, cultura y paisajes del Caribe. Puedes recorrer la Ciudad Amurallada, conocer sus calles coloniales, disfrutar de su gastronomía y descubrir lugares llenos de historia mientras contemplas el mar.",
  },
  {
    imagen: ejeCafetero,
    imagenModal: ejecagetero2,
    titulo: "Eje Cafetero",
    descripcion:
      "Paisajes cafeteros, montañas y experiencias únicas rodeadas de naturaleza.",
    descripcionModal:
      "El Eje Cafetero ofrece una experiencia rodeada de montañas, cultivos de café y pequeños pueblos llenos de tradición. Es un destino ideal para conocer la cultura cafetera y disfrutar de sus paisajes.",
  },
  {
    imagen: guatape,
    imagenModal: guatape2,
    titulo: "Guatapé",
    descripcion:
      "Coloridas calles, naturaleza y la impresionante Piedra del Peñol.",
    descripcionModal:
      "Guatapé es reconocido por sus coloridas construcciones y sus paisajes alrededor del embalse. Una de sus principales atracciones es la Piedra del Peñol, desde donde se puede apreciar una espectacular vista de la región.",
  },
  {
    imagen: islaRosario,
    imagenModal: islaRosario2,
    titulo: "Islas del Rosario",
    descripcion:
      "Playas cristalinas, arrecifes y paisajes paradisíacos del Caribe.",
    descripcionModal:
      "Las Islas del Rosario son un destino ideal para disfrutar del mar Caribe, practicar actividades acuáticas y explorar sus aguas cristalinas y ecosistemas marinos.",
  },
  {
    imagen: medellin2,
    imagenModal: medellin,
    titulo: "Medellín",
    descripcion:
      "Una ciudad innovadora llena de cultura, gastronomía y experiencias.",
    descripcionModal:
      "Medellín combina innovación, cultura y naturaleza. Sus barrios, espacios culturales, gastronomía y sistema de transporte permiten descubrir una ciudad dinámica y llena de experiencias.",
  },
  {
    imagen: salento2,
    imagenModal: salento,
    titulo: "Salento",
    descripcion:
      "Arquitectura tradicional, montañas y el encanto del corazón cafetero.",
    descripcionModal:
      "Salento conserva el encanto de un pueblo tradicional del Quindío. Sus calles, artesanías y paisajes cafeteros lo convierten en un lugar perfecto para disfrutar de la cultura y la naturaleza.",
  },
  {
    imagen: sanAndres,
    imagenModal: sanAndres,
    titulo: "San Andrés",
    descripcion:
      "Mar de siete colores, playas increíbles y cultura isleña.",
    descripcionModal:
      "San Andrés ofrece playas, aguas de diferentes tonalidades y una cultura isleña particular. Es un destino perfecto para relajarse, disfrutar del mar y conocer sus tradiciones.",
  },
  {
    imagen: tayrona,
    imagenModal: tayrona2,
    titulo: "Parque Tayrona",
    descripcion:
      "Naturaleza exuberante, senderos y playas únicas del Caribe colombiano.",
    descripcionModal:
      "El Parque Tayrona reúne selva, montañas y playas del Caribe en un mismo escenario. Sus senderos permiten descubrir diferentes paisajes mientras se disfruta de la biodiversidad de la región.",
  },
  {
    imagen: valleCocora,
    imagenModal: valleCocora,
    titulo: "Valle de Cocora",
    descripcion:
      "Gigantescas palmas de cera y uno de los paisajes más representativos de Colombia.",
    descripcionModal:
      "El Valle de Cocora destaca por sus enormes palmas de cera y sus montañas verdes. Es uno de los paisajes más representativos de la región cafetera y un lugar ideal para realizar caminatas.",
  },
  {
    imagen: villaLeyva,
    imagenModal: villaLeyva,
    titulo: "Villa de Leyva",
    descripcion:
      "Historia, arquitectura colonial y uno de los pueblos más encantadores del país.",
    descripcionModal:
      "Villa de Leyva conserva una arquitectura colonial característica y una de las plazas más reconocidas del país. Sus calles, museos y alrededores permiten disfrutar de historia y cultura.",
  },
];

function Destinos() {
  return (
    <main className="bg-[#f8f6ef]">

      <section className="bg-[#004f54] px-6 py-20 text-center text-white">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-[#f4b942]">
          Descubre Colombia
        </p>

        <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
          Todos nuestros destinos
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/80">
          Explora diferentes regiones de Colombia y encuentra el destino
          perfecto para tu próxima aventura.
        </p>
      </section>
    
      <section className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {destinos.map((destino) => (
          <DestinoCard
            key={destino.titulo}
            imagen={destino.imagen}
            imagenModal={destino.imagenModal}
            titulo={destino.titulo}
            descripcion={destino.descripcion}
            descripcionModal={destino.descripcionModal}
          />
        ))}
      </section>
    </main>
  );
}

export default Destinos;