// src/pages/quienes-somos.jsx

function QuienesSomos() {
  return (
    <main className="bg-[#f8f6ef]">

      <section className="bg-[#004f54] px-6 py-20 text-center text-white">
        <span className="text-sm font-bold uppercase tracking-[0.3em] text-[#f4b942]">
          Conócenos
        </span>

        <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
          Sobre nosotros
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/80">
          Somos una plataforma dedicada a mostrar la riqueza turística de
          Colombia y ayudarte a descubrir experiencias inolvidables.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-12 md:grid-cols-2">

          <div>
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-[#f4b942]">
              Nuestra esencia
            </span>

            <h2 className="mt-3 text-3xl font-extrabold text-[#087f8c] md:text-4xl">
              Descubre Colombia con nosotros
            </h2>

            <p className="mt-6 leading-relaxed text-gray-600">
              En Turismo Colombia queremos conectar a los viajeros con los
              lugares más especiales de nuestro país. Nuestra plataforma
              reúne destinos, paisajes, cultura y experiencias para facilitar
              la búsqueda de nuevas aventuras.
            </p>

            <p className="mt-4 leading-relaxed text-gray-600">
              Creemos que cada región de Colombia tiene algo único que ofrecer,
              desde sus ciudades y pueblos hasta sus playas, montañas y
              paisajes naturales.
            </p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="grid grid-cols-2 gap-5">

              <div className="rounded-2xl bg-[#087f8c] p-6 text-white">
                <p className="text-3xl font-extrabold">10+</p>
                <p className="mt-2 text-sm text-white/80">
                  Destinos destacados
                </p>
              </div>

              <div className="rounded-2xl bg-[#f4b942] p-6 text-[#004f54]">
                <p className="text-3xl font-extrabold">5</p>
                <p className="mt-2 text-sm">
                  Regiones para explorar
                </p>
              </div>

              <div className="rounded-2xl bg-gray-100 p-6">
                <p className="text-3xl font-extrabold text-[#087f8c]">
                  100%
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Experiencias colombianas
                </p>
              </div>

              <div className="rounded-2xl bg-gray-100 p-6">
                <p className="text-3xl font-extrabold text-[#087f8c]">
                  1
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  País por descubrir
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">

          <article className="rounded-3xl border border-gray-100 p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#087f8c] text-2xl text-white">
              🎯
            </div>

            <h2 className="text-2xl font-extrabold text-[#087f8c]">
              Nuestra misión
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Facilitar a los viajeros el descubrimiento de destinos
              colombianos mediante una plataforma clara, atractiva y fácil de
              utilizar.
            </p>
          </article>

          <article className="rounded-3xl border border-gray-100 p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4b942] text-2xl">
              🌎
            </div>

            <h2 className="text-2xl font-extrabold text-[#087f8c]">
              Nuestra visión
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Convertirnos en una referencia digital para quienes desean
              conocer y explorar la diversidad turística, cultural y natural
              de Colombia.
            </p>
          </article>

        </div>
      </section>

      {/* VALORES */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl text-center">

          <span className="text-sm font-bold uppercase tracking-[0.25em] text-[#f4b942]">
            Lo que nos representa
          </span>

          <h2 className="mt-3 text-3xl font-extrabold text-[#087f8c] md:text-4xl">
            Nuestros valores
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">

            <article className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="text-4xl">❤️</div>

              <h3 className="mt-5 text-xl font-bold text-[#087f8c]">
                Pasión
              </h3>

              <p className="mt-3 leading-relaxed text-gray-600">
                Nos inspira la diversidad y belleza de Colombia.
              </p>
            </article>

            <article className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="text-4xl">🌱</div>

              <h3 className="mt-5 text-xl font-bold text-[#087f8c]">
                Responsabilidad
              </h3>

              <p className="mt-3 leading-relaxed text-gray-600">
                Promovemos el respeto por nuestros destinos y su entorno.
              </p>
            </article>

            <article className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="text-4xl">✨</div>

              <h3 className="mt-5 text-xl font-bold text-[#087f8c]">
                Calidad
              </h3>

              <p className="mt-3 leading-relaxed text-gray-600">
                Buscamos ofrecer una experiencia sencilla, moderna y
                agradable.
              </p>
            </article>

          </div>
        </div>
      </section>

    </main>
  );
}

export default QuienesSomos;