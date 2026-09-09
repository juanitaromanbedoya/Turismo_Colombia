import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.svg";
import { useState } from "react";

function SidebarAdmin({ usuario, setUsuario }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const enlaces = [
    { ruta: "/", etiqueta: "Inicio", icono: "🏠" },
    { ruta: "/destinos", etiqueta: "Destinos", icono: "📍" },
    { ruta: "/Servicios", etiqueta: "Servicios", icono: "🛎️" },
    { ruta: "/quienes-somos", etiqueta: "Nosotros", icono: "ℹ️" },
    { ruta: "/contacto", etiqueta: "Contacto", icono: "✉️" },
  ];

  const linkClass = (ruta) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
      location.pathname === ruta
        ? "bg-[#087f8c] text-white"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    window.dispatchEvent(new Event("auth-cambio"));
    navigate("/");
  };

  const verPanel = () => {
    setMenuMovilAbierto(false);
    if (usuario.rol === "Administrador") navigate("/panel-administrador");
    else if (usuario.rol === "Empleado") navigate("/panel-empleado");
  };

  const contenidoMenu = (
    <>
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#087f8c] text-sm font-bold text-white">
          {usuario.nombre?.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-700">Bienvenido,</p>
          <p className="text-sm font-bold text-[#087f8c]">{usuario.nombre}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {enlaces.map((enlace) => (
          <Link
            key={enlace.ruta}
            to={enlace.ruta}
            onClick={() => setMenuMovilAbierto(false)}
            className={linkClass(enlace.ruta)}
          >
            <span>{enlace.icono}</span>
            {enlace.etiqueta}
          </Link>
        ))}
      </nav>

      <div className="mt-6 space-y-1 border-t border-gray-100 pt-4">
        <button
          onClick={verPanel}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-gray-600 transition hover:bg-gray-100"
        >
          ⚙️ Panel de gestión
        </button>
        <button
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-500 transition hover:bg-red-50"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* BARRA SUPERIOR MÓVIL (solo cuando no hay sidebar visible) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Turismo Colombia" className="h-10 w-auto object-contain" />
        </Link>
        <button
          onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#087f8c]"
          aria-label="Abrir menú"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuMovilAbierto ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuMovilAbierto && (
        <div className="border-b border-gray-100 bg-white px-4 py-4 lg:hidden">
          {contenidoMenu}
        </div>
      )}

      {/* SIDEBAR FIJO (solo escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r border-gray-100 bg-white px-4 py-6 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <img src={logo} alt="Turismo Colombia" className="h-14 w-auto object-contain" />
        </Link>
        {contenidoMenu}
      </aside>
    </>
  );
}

export default SidebarAdmin;