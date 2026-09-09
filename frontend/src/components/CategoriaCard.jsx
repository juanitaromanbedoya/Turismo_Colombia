function CategoriaCard({ icono, titulo, descripcion }) {
  return (
    <article className="group rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f7f7] text-3xl transition duration-300 group-hover:scale-110">
        {icono}
      </div>

      <h3 className="mb-3 text-2xl font-bold text-[#087f8c]">
        {titulo}
      </h3>

      <p className="leading-relaxed text-gray-600">
        {descripcion}
      </p>
    </article>
  );
}

export default CategoriaCard;