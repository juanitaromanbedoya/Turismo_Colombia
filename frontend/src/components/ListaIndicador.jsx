import { useState } from "react";

const coloresEstado = {
  Activo: "bg-green-100 text-green-700",
  Inactivo: "bg-red-100 text-red-700",
};

const FILTROS = ["Todos", "Activo", "Inactivo"];

function ListaIndicador({ tarjeta, onCerrar }) {
  const [filtro, setFiltro] = useState("Todos");

  const items = tarjeta.lista.filter((i) => filtro === "Todos" || i.estado === filtro);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#087f8c]">
              {tarjeta.lista_titulo || tarjeta.titulo}
            </h3>
            <p className="text-sm text-gray-500">
              Mostrando {items.length} de {tarjeta.lista.length}
            </p>
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
                filtro === f
                  ? "bg-[#087f8c] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "Todos" ? "Todos" : `${f}s`}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No hay elementos con ese filtro.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-700">{item.titulo}</p>
                  {item.subtitulo && <p className="text-xs text-gray-500">{item.subtitulo}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  {item.valor && <span className="font-semibold text-gray-700">{item.valor}</span>}
                  {item.estado && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        coloresEstado[item.estado] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.estado}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ListaIndicador;