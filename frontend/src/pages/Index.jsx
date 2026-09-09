import Hero from "../components/Hero";
import Carrusel from "../components/Carrusel";
import DestinoCard from "../components/DestinoCard";
import CategoriaCard from "../components/CategoriaCard";
import cartagena from "../assets/images/cartagena.jpg";
import cartagena2 from "../assets/images/cartagena2.jpg";
import guatape from "../assets/images/guatape.jpg";
import guatape2 from "../assets/images/guatape2.jpg"
import tayrona from "../assets/images/tayrona.jpg";
import tayrona2 from "../assets/images/tayrona2.jpg";

function Index() {
  return (
    <main className="w-full">

      <Hero />

      <div className="mx-auto w-[90%] max-w-[1200px]">

      
      <section id="destinos" className="py-20">

        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.40em] text-[#f4b942]">
            Lugares increíbles
          </p>

          <h2 className="mb-4 text-4xl font-extrabold text-[#087f8c] md:text-5xl">
            Destinos destacados
          </h2>

          <p className="mx-auto max-w-2xl text-gray-600">
            Colombia está llena de lugares maravillosos. Conoce algunos de
            los destinos que hacen de nuestro país un lugar único.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

          <DestinoCard
            imagen={cartagena}
            imagenModal={cartagena2}
            titulo="Cartagena de Indias"
            descripcionModal={"Descubre la joya amurallada del Caribe, camina por sus icónicos rincones coloniales y déjate cautivar por el atardecer perfecto. Un destino imprescindible en tu viaje por Colombia."}

            descripcion="Descubre la magia de la ciudad amurallada, sus playas, historia y arquitectura colonial."
          />

          <DestinoCard
            imagen={guatape}
            imagenModal={guatape2}
            titulo="Guatapé"
            descripcionModal={"Descubre Guatapé, el pueblo más colorido de Colombia y un verdadero paraíso a pocas horas de Medellín. Camina por calles llenas de vida, adorno y tradición en sus famosos zócalos tallados, navega por las aguas turquesas de su impresionante embalse y desafía los 702 escalones de la Piedra del Peñol para contemplar una de las mejores vistas panorámicas del mundo."}
            descripcion="Disfruta de sus coloridas calles, paisajes naturales y la impresionante Piedra del Peñol."
          />

          <DestinoCard
            imagen={tayrona}
            imagenModal={tayrona2}
            titulo="Parque Tayrona"
            descripcionModal={"Adéntrate en el Parque Nacional Natural Tayrona, donde la imponente selva tropical de la Sierra Nevada se funde directamente con las aguas turquesas del Caribe colombiano. Un santuario natural en Santa Marta ideal para desconectarte del mundo, caminar entre senderos rodeados de fauna exótica y descansar sobre playas vírgenes enmarcadas por gigantescas rocas volcánicas."}
            descripcion="Explora playas paradisíacas, naturaleza exuberante y paisajes únicos en el Caribe colombiano."
          />

        </div>
      </section>

      {/* Carrusel */}
      <section className="pb-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#f4b942]">
            Más lugares para conocer
          </p>

          <h2 className="text-4xl font-extrabold text-[#087f8c] md:text-5xl">
            Nustros destinos recomendados
          </h2>
        </div>

        <Carrusel />

      </section>

      {/* Categorías */}
  <section className="py-20">

  <div className="mb-12 text-center">
    <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#f4b942]">
      Vive diferentes experiencias
    </p>

    <h2 className="mb-4 text-4xl font-extrabold text-[#087f8c] md:text-5xl">
      Explora Colombia
    </h2>

    <p className="mx-auto max-w-2xl text-gray-600">
      Elige tu próxima aventura y descubre todo lo que Colombia tiene para
      ofrecer.
    </p>
  </div>

  <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

    <CategoriaCard
      icono="🌿"
      titulo="Naturaleza"
      descripcion="Descubre montañas, selvas, parques naturales y paisajes increíbles."
    />

    <CategoriaCard
      icono="🏛️"
      titulo="Cultura"
      descripcion="Conoce nuestra historia, arquitectura, gastronomía y tradiciones."
    />

    <CategoriaCard
      icono="🌊"
      titulo="Playas"
      descripcion="Relájate en playas paradisíacas y descubre el Caribe colombiano."
    />

    </div>

  </section>
  
      </div>
    </main>
  );
}

export default Index;