import { useEffect, useState } from "react";

import cartagena from "../assets/images/cartagena.jpg";
import ejeCafetero from "../assets/images/eje-cafetero.jpg";
import guatape from "../assets/images/guatape.jpg";
import islaRosario from "../assets/images/isla-rosario.jpg";
import medellin from "../assets/images/medellin.jpg";
import salento from "../assets/images/salento.jpg";
import tayrona from "../assets/images/tayrona.jpg";

const imagenesDisponibles = [
 {
    nombre: "tayrona.jpg",
    etiqueta: "Tayrona",
    src: tayrona,
  },

  {
    nombre: "cartagena.jpg",
    etiqueta: "Cartagena",
    src: cartagena,
  },
  {
    nombre: "eje-cafetero.jpg",
    etiqueta: "Eje Cafetero",
    src: ejeCafetero,
  },
  {
    nombre: "guatape.jpg",
    etiqueta: "Guatapé",
    src: guatape,
  },
  {
    nombre: "isla-rosario.jpg",
    etiqueta: "Islas del Rosario",
    src: islaRosario,
  },
  {
    nombre: "medellin.jpg",
    etiqueta: "Medellín",
    src: medellin,
  },
  {
    nombre: "salento.jpg",
    etiqueta: "Salento",
    src: salento,
  },
];

const categoriasDisponibles = [
  "Alojamiento",
  "Transporte",
  "Tours y excursiones",
  "Gastronomía",
  "Actividades",
  "Experiencias",
];

function ServicioModal({ servicio, onClose, onGuardar }) {
const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    descripcion_detallada: "",
    precio: "",
    imagen: "",
    categoria: "",
    duracion: "",
    ubicacion: "",
    cupo_maximo: "",
    incluye_transporte: false,
    incluye_alimentacion: false,
    detalle_incluye: "",
});

const [errores, setErrores] = useState({
    nombre: "",
    descripcion: "",
    descripcion_detallada: "",
    precio: "",
    imagen: "",
    categoria: "",
    duracion: "",
    ubicacion: "",
    cupo_maximo: "",
    detalle_incluye: "",
});

useEffect(() => {
    if (servicio) {
      setFormulario({
        nombre: servicio.nombre || "",
        descripcion: servicio.descripcion || "",
        descripcion_detallada: servicio.descripcion_detallada || "",
        precio: servicio.precio ?? "",
        imagen: servicio.imagen || "",
        categoria: servicio.categoria || "",
        duracion: servicio.duracion || "",
        ubicacion: servicio.ubicacion || "",
        cupo_maximo: servicio.cupo_maximo ?? "",
        incluye_transporte: servicio.incluye_transporte || false,
        incluye_alimentacion: servicio.incluye_alimentacion || false,
        detalle_incluye: servicio.detalle_incluye || "",
      });
    } else {
      setFormulario({
        nombre: "",
        descripcion: "",
        descripcion_detallada: "",
        precio: "",
        imagen: "",
        categoria: "",
        duracion: "",
        ubicacion: "",
        cupo_maximo: "",
        incluye_transporte: false,
        incluye_alimentacion: false,
        detalle_incluye: "",
      });
    }   

    setErrores({
      nombre: "",
      descripcion: "",
      descripcion_detallada: "",
      precio: "",
      imagen: "",
      categoria: "",
      duracion: "",
      ubicacion:"",
      cupo_maximo:"",
      detalle_incluye: "",
    });
  }, [servicio]);

  // ================================
  // VALIDACIONES
  // ================================

  const validarNombre = (valor) => {
    if (!valor.trim()) {
      return "El nombre del servicio es obligatorio.";
    }

    if (valor.trim().length < 3) {
      return "El nombre debe tener mínimo 3 caracteres.";
    }

    if (valor.trim().length > 100) {
      return "El nombre no puede superar los 100 caracteres.";
    }

    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\s.,'()-]+$/;

    if (!regex.test(valor)) {
      return "El nombre contiene caracteres no permitidos.";
    }

    return "";
  };

  const validarDescripcion = (valor) => {
    if (!valor.trim()) {
      return "La descripción es obligatoria.";
    }

    if (valor.trim().length < 10) {
      return "La descripción debe tener mínimo 10 caracteres.";
    }

    if (valor.trim().length > 500) {
      return "La descripción no puede superar los 500 caracteres.";
    }

    return "";
  };

  const validarDescripcionDetallada = (valor) => {
    if (!valor.trim()) {
      return "";
    }

    if (valor.trim().length < 20) {
      return "Si la agregas, debe tener mínimo 20 caracteres.";
    }

    if (valor.trim().length > 1000) {
      return "No puede superar los 1000 caracteres.";
    }

    return "";
  };

  const validarPrecio = (valor) => {
    if (valor === "") {
      return "El precio es obligatorio.";
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
      return "El precio debe ser un número válido.";
    }

    if (numero <= 0) {
      return "El precio debe ser mayor que 0.";
    }

    if (numero > 999999999) {
      return "El precio es demasiado alto.";
    }

    return "";
  };

  const validarImagen = (valor) => {
    if (!valor) {
      return "Debes seleccionar una imagen.";
    }

    const existe = imagenesDisponibles.some(
      (imagen) => imagen.nombre === valor
    );

    if (!existe) {
      return "La imagen seleccionada no es válida.";
    }

    return "";
  };

  const validarCategoria = (valor) => {
    if (!valor) {
      return "Debes seleccionar una categoría.";
    }

    if (!categoriasDisponibles.includes(valor)) {
      return "La categoría seleccionada no es válida.";
    }

    return "";
};

const validarDuracion = (valor) => {
    if (!valor.trim()) {
      return "La duración es obligatoria.";
    }

    if (valor.trim().length < 3) {
      return "La duración debe tener mínimo 3 caracteres.";
    }

    if (valor.trim().length > 50) {
      return "La duración no puede superar los 50 caracteres.";
    }

    return "";
};

const validarUbicacion = (valor) => {
    if (!valor.trim()) {
      return "La ubicación es obligatoria.";
    }

    if (valor.trim().length < 3) {
      return "La ubicación debe tener mínimo 3 caracteres.";
    }

    if (valor.trim().length > 100) {
      return "La ubicación no puede superar los 100 caracteres.";
    }

    return "";
};

const validarCupoMaximo = (valor) => {
    if (valor === "") {
      return "";
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
      return "El cupo debe ser un número válido.";
    }

    if (numero <= 0) {
      return "El cupo debe ser mayor que 0.";
    }

    if (numero > 1000) {
      return "El cupo máximo permitido es 1000 personas.";
    }

    return "";
};

  // ================================
  // CAMBIOS DEL FORMULARIO
  // ================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let nuevoValor = type === "checkbox" ? checked : value;

    // Limitar nombre
    if (name === "nombre") {
      nuevoValor = value.slice(0, 100);
    }

    // Limitar descripción
    if (name === "descripcion") {
      nuevoValor = value.slice(0, 500);
    }

    // Limitar descripción detallada
    if (name === "descripcion_detallada") {
      nuevoValor = value.slice(0, 1000);
    }

    // Limitar detalle de qué incluye
    if (name === "detalle_incluye") {
      nuevoValor = value.slice(0, 300);
    }

    // Controlar precio
    if (name === "precio") {
      nuevoValor = value;

      // Evitar valores negativos
      if (nuevoValor < 0) {
        nuevoValor = "";
      }
    }

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: nuevoValor,
    }));

    // Validación en tiempo real
    let mensajeError = "";

    if (name === "nombre") {
      mensajeError = validarNombre(nuevoValor);
    }

    if (name === "descripcion") {
      mensajeError = validarDescripcion(nuevoValor);
    }

    if (name === "descripcion_detallada") {
      mensajeError = validarDescripcionDetallada(nuevoValor);
    }

    if (name === "precio") {
      mensajeError = validarPrecio(nuevoValor);
    }

    if (name === "imagen") {
      mensajeError = validarImagen(nuevoValor);
    }

    if (name === "categoria") {
      mensajeError = validarCategoria(nuevoValor);
    }

    if (name === "duracion") {
      mensajeError = validarDuracion(nuevoValor);
    }

    if (name === "ubicacion") {
      mensajeError = validarUbicacion(nuevoValor);
    }

    if (name === "cupo_maximo") {
      mensajeError = validarCupoMaximo(nuevoValor);
    }

    setErrores((erroresActuales) => ({
      ...erroresActuales,
      [name]: mensajeError,
    }));
  };

  // ================================
  // VALIDAR TODO EL FORMULARIO
  // ================================

 const validarFormulario = () => {
    const nuevosErrores = {
      nombre: validarNombre(formulario.nombre),
      descripcion: validarDescripcion(formulario.descripcion),
      precio: validarPrecio(formulario.precio),
      imagen: validarImagen(formulario.imagen),
      categoria: validarCategoria(formulario.categoria),
      duracion: validarDuracion(formulario.duracion),
      ubicacion: validarUbicacion(formulario.ubicacion),
      cupo_maximo: validarCupoMaximo(formulario.cupo_maximo),
    };

    setErrores(nuevosErrores);

    return !Object.values(nuevosErrores).some(
      (error) => error !== ""
    );
  };

  // ================================
  // ENVIAR FORMULARIO
  // ================================

const handleSubmit = (e) => {
    e.preventDefault();

    const formularioValido = validarFormulario();

    if (!formularioValido) {
      return;
    }

    onGuardar({
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      descripcion_detallada: formulario.descripcion_detallada.trim() || null,
      precio: Number(formulario.precio),
      imagen: formulario.imagen,
      categoria: formulario.categoria || null,
      duracion: formulario.duracion.trim() || null,
      ubicacion: formulario.ubicacion.trim() || null,
      cupo_maximo: formulario.cupo_maximo
        ? Number(formulario.cupo_maximo)
        : null,
      incluye_transporte: formulario.incluye_transporte,
      incluye_alimentacion: formulario.incluye_alimentacion,
      detalle_incluye: formulario.detalle_incluye.trim() || null,
    });
};

  
  // ================================
  // IMAGEN SELECCIONADA
  // ================================

  const imagenSeleccionada = imagenesDisponibles.find(
    (imagen) => imagen.nombre === formulario.imagen
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">

        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-600 hover:bg-red-100 hover:text-red-500"
        >
          ×
        </button>

        {/* Encabezado */}
        <div className="mb-8 pr-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#f4b942]">
            Administración
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-[#087f8c]">
            {servicio ? "Editar servicio" : "Crear servicio"}
          </h2>

          <p className="mt-2 text-gray-500">
            {servicio
              ? "Modifica la información del servicio."
              : "Completa los datos para registrar un nuevo servicio."}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          <div className="grid grid-cols-1 gap-5">

            {/* ================================
                NOMBRE
            ================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nombre del servicio
              </label>

              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                maxLength={100}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                  errores.nombre
                    ? "border-red-400 focus:border-red-500"
                    : formulario.nombre &&
                      !validarNombre(formulario.nombre)
                    ? "border-green-400 focus:border-green-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
                placeholder="Ej: Tour por Guatapé"
              />

              <div className="mt-1 flex justify-between">
                <p
                  className={`text-sm ${
                    errores.nombre
                      ? "text-red-500"
                      : formulario.nombre &&
                        !validarNombre(formulario.nombre)
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {errores.nombre ||
                    (formulario.nombre &&
                    !validarNombre(formulario.nombre)
                      ? "Nombre válido."
                      : "Mínimo 3 y máximo 100 caracteres.")}
                </p>

                <span className="text-xs text-gray-400">
                  {formulario.nombre.length}/100
                </span>
              </div>
            </div>

            {/* ================================
                DESCRIPCIÓN
            ================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Descripción
              </label>

              <textarea
                name="descripcion"
                value={formulario.descripcion}
                onChange={handleChange}
                rows="4"
                maxLength={500}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                  errores.descripcion
                    ? "border-red-400 focus:border-red-500"
                    : formulario.descripcion &&
                      !validarDescripcion(formulario.descripcion)
                    ? "border-green-400 focus:border-green-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
                placeholder="Describe el servicio..."
              />

              <div className="mt-1 flex justify-between">
                <p
                  className={`text-sm ${
                    errores.descripcion
                      ? "text-red-500"
                      : formulario.descripcion &&
                        !validarDescripcion(formulario.descripcion)
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {errores.descripcion ||
                    (formulario.descripcion &&
                    !validarDescripcion(formulario.descripcion)
                      ? "Descripción válida."
                      : "Mínimo 10 y máximo 500 caracteres.")}
                </p>

                <span className="text-xs text-gray-400">
                  {formulario.descripcion.length}/500
                </span>
              </div>
            </div>

            {/* ================================
                DESCRIPCIÓN DETALLADA
            ================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Descripción detallada (para "Saber más")
              </label>

              <textarea
                name="descripcion_detallada"
                value={formulario.descripcion_detallada}
                onChange={handleChange}
                rows="5"
                maxLength={1000}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                  errores.descripcion_detallada
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
                placeholder="Información completa: itinerario, qué llevar, recomendaciones, etc. (opcional)"
              />

              <div className="mt-1 flex justify-between">
                <p
                  className={`text-sm ${
                    errores.descripcion_detallada
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {errores.descripcion_detallada ||
                    "Opcional. Se muestra en la página de detalle del servicio."}
                </p>

                <span className="text-xs text-gray-400">
                  {formulario.descripcion_detallada.length}/1000
                </span>
              </div>
            </div>

            {/* ================================
                PRECIO
            ================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Precio
              </label>

              <input
                type="number"
                name="precio"
                value={formulario.precio}
                onChange={handleChange}
                min="1"
                max="999999999"
                step="0.01"
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                  errores.precio
                    ? "border-red-400 focus:border-red-500"
                    : formulario.precio &&
                      !validarPrecio(formulario.precio)
                    ? "border-green-400 focus:border-green-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
                placeholder="Ej: 150000"
              />

              <p
                className={`mt-1 text-sm ${
                  errores.precio
                    ? "text-red-500"
                    : formulario.precio &&
                      !validarPrecio(formulario.precio)
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {errores.precio ||
                  (formulario.precio &&
                  !validarPrecio(formulario.precio)
                    ? "Precio válido."
                    : "Debe ser un valor mayor que 0.")}
              </p>
            </div>

            {/* ================================
                IMAGEN
            ================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Imagen del servicio
              </label>

              <select
                name="imagen"
                value={formulario.imagen}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                  errores.imagen
                    ? "border-red-400 focus:border-red-500"
                    : formulario.imagen &&
                      !validarImagen(formulario.imagen)
                    ? "border-green-400 focus:border-green-500"
                    : "border-gray-300 focus:border-[#087f8c]"
                }`}
              >
                <option value="">
                  Seleccionar imagen
                </option>

                {imagenesDisponibles.map((imagen) => (
                  <option
                    key={imagen.nombre}
                    value={imagen.nombre}
                  >
                    {imagen.etiqueta}
                  </option>
                ))}
              </select>

              <p
                className={`mt-1 text-sm ${
                  errores.imagen
                    ? "text-red-500"
                    : formulario.imagen &&
                      !validarImagen(formulario.imagen)
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {errores.imagen ||
                  (formulario.imagen &&
                  !validarImagen(formulario.imagen)
                    ? "Imagen válida."
                    : "Selecciona una imagen disponible.")}
              </p>

              {/* Vista previa */}
              {imagenSeleccionada && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  <img
                    src={imagenSeleccionada.src}
                    alt={imagenSeleccionada.etiqueta}
                    className="h-56 w-full object-cover"
                  />

                  <div className="p-4">
                    <p className="font-semibold text-[#087f8c]">
                      {imagenSeleccionada.etiqueta}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Archivo: {imagenSeleccionada.nombre}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* ================================
                CATEGORÍA
            ================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Categoría
              </label>

              <select
                name="categoria"
                value={formulario.categoria}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#087f8c]"
              >
                <option value="">Seleccionar categoría</option>

                {categoriasDisponibles.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* ================================
                DURACIÓN Y UBICACIÓN
            ================================= */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Duración
                </label>
                <input
                    type="text"
                    name="duracion"
                    value={formulario.duracion}
                    onChange={handleChange}
                    placeholder="Ej: 3 horas, 2 días 1 noche"
                    maxLength={50}
                    className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                    errores.duracion
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-[#087f8c]"
                    }`}
                />

                {errores.duracion && (
                    <p className="mt-1 text-sm text-red-500">{errores.duracion}</p>
                )}
                </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Ubicación
                </label>

                <input
                  type="text"
                  name="ubicacion"
                  value={formulario.ubicacion}
                  onChange={handleChange}
                  placeholder="Ej: Santa Marta, Magdalena"
                  maxLength={100}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#087f8c]"
                />
              </div>
            </div>

            {/* ================================
                CUPO MÁXIMO
            ================================= */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Cupo máximo (opcional)
              </label>

              <input
                type="number"
                name="cupo_maximo"
                value={formulario.cupo_maximo}
                onChange={handleChange}
                min="1"
                placeholder="Ej: 20 personas"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#087f8c]"
              />
            </div>

            {/* ================================
                QUÉ INCLUYE
            ================================= */}

            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                ¿Qué incluye este servicio?
              </p>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="incluye_transporte"
                    checked={formulario.incluye_transporte}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#087f8c]"
                  />
                  🚐 Transporte
                </label>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="incluye_alimentacion"
                    checked={formulario.incluye_alimentacion}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#087f8c]"
                  />
                  🍽️ Alimentación
                </label>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Detalle adicional (opcional)
                </label>

                <input
                  type="text"
                  name="detalle_incluye"
                  value={formulario.detalle_incluye}
                  onChange={handleChange}
                  maxLength={300}
                  placeholder="Ej: Incluye guía turístico y 2 comidas"
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                    errores.detalle_incluye
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-300 focus:border-[#087f8c]"
                  }`}
                />

                {errores.detalle_incluye && (
                  <p className="mt-1 text-sm text-red-500">{errores.detalle_incluye}</p>
                )}
              </div>
            </div>
          </div>

          {/* ================================
              BOTONES
          ================================= */}

          <div className="mt-8 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-6 py-3 font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={Object.values(errores).some(
                (error) => error !== ""
              )}
              className={`rounded-xl px-6 py-3 font-bold text-white transition ${
                Object.values(errores).some(
                  (error) => error !== ""
                )
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[#087f8c] hover:bg-[#006b75]"
              }`}
            >
              {servicio
                ? "Guardar cambios"
                : "Crear servicio"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default ServicioModal;