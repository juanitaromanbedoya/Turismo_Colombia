import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.svg";
import { useState } from "react";

function SidebarAdmin({ usuario, setUsuario, colapsado, setColapsado, onVerComoCliente, seccion, setSeccion }) {
  const navigate = useNavigate();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const seccionesAdmin = [
    { id: "resumen", etiqueta: "Resumen", icono: "📊" },
    { id: "usuarios", etiqueta: "Usuarios", icono: "👥" },
    { id: "servicios", etiqueta: "Servicios", icono: "🛎️" },
    { id: "estadisticas", etiqueta: "Reservas", icono: "📈" },
    { id: "dashboard-ventas", etiqueta: "Dashboard de ventas", icono: "📈" },
    { id: "ventas", etiqueta: "Ventas", icono: "🧾" },
    { id: "reporte", etiqueta: "Reporte diario", icono: "📅" },
    { id: "facturas", etiqueta: "Facturas", icono: "📑" },
    { id: "pqr", etiqueta: "PQR", icono: "💬" },
    { id: "perfil", etiqueta: "Mi perfil", icono: "👤" },
  ];

  const seccionesEmpleado = [
    { id: "resumen", etiqueta: "Resumen", icono: "📊" },
    { id: "dashboard-ventas", etiqueta: "Dashboard de ventas", icono: "📈" },
    { id: "servicios", etiqueta: "Servicios", icono: "🛎️" },
    { id: "ventas", etiqueta: "Ventas", icono: "🧾" },
    { id: "reporte", etiqueta: "Reporte diario", icono: "📅" },
    { id: "facturas", etiqueta: "Facturas", icono: "📑" },
    { id: "pqr", etiqueta: "PQR", icono: "💬" },
    { id: "perfil", etiqueta: "Mi perfil", icono: "👤" },
  ];

  const secciones = usuario.rol === "Administrador" ? seccionesAdmin : seccionesEmpleado;
  const rutaPanel = usuario.rol === "Administrador" ? "/panel-administrador" : "/panel-empleado";

  const irASeccion = (idSeccion) => {
    setSeccion(idSeccion);
    setMenuMovilAbierto(false);
    navigate(rutaPanel);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    window.dispatchEvent(new Event("auth-cambio"));
    navigate("/");
  };

  const contenidoMenu = (soloIconosEnDesktop = false) => (
    <>
      <div className={`mb-6 flex items-center gap-3 rounded-xl bg-gray-50 p-3 ${soloIconosEnDesktop ? "lg:justify-center lg:p-2" : ""}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#087f8c] text-sm font-bold text-white">
          {usuario.nombre?.charAt(0).toUpperCase()}
        </span>
        <div className={soloIconosEnDesktop ? "lg:hidden" : ""}>
          <p className="text-sm font-semibold text-gray-700">Bienvenido,</p>
          <p className="text-sm font-bold text-[#087f8c]">{usuario.nombre}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {secciones.map((s) => (
          <button
            key={s.id}
            onClick={() => irASeccion(s.id)}
            title={soloIconosEnDesktop ? s.etiqueta : ""}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition ${
              seccion === s.id ? "bg-[#087f8c] text-white" : "text-gray-600 hover:bg-gray-100"
            } ${soloIconosEnDesktop ? "lg:justify-center lg:px-0" : ""}`}
          >
            <span>{s.icono}</span>
            <span className={soloIconosEnDesktop ? "lg:hidden" : ""}>{s.etiqueta}</span>
          </button>
        ))}
      </nav>

      <div className="mt-6 space-y-1 border-t border-gray-100 pt-4">
        <button
          onClick={() => {
            setMenuMovilAbierto(false);
            onVerComoCliente();
          }}
          title={soloIconosEnDesktop ? "Ir a página" : ""}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-gray-600 transition hover:bg-gray-100 ${
            soloIconosEnDesktop ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          🌐 <span className={soloIconosEnDesktop ? "lg:hidden" : ""}>Ir a página</span>
        </button>

        <button
          onClick={cerrarSesion}
          title={soloIconosEnDesktop ? "Cerrar sesión" : ""}
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-500 transition hover:bg-red-50 ${
            soloIconosEnDesktop ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          🚪 <span className={soloIconosEnDesktop ? "lg:hidden" : ""}>Cerrar sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
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

      {menuMovilAbierto && (
        <div className="border-b border-gray-100 bg-white px-4 py-4 lg:hidden">
          {contenidoMenu(false)}
        </div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col overflow-y-auto border-r border-gray-100 bg-white px-4 py-6 transition-all duration-300 lg:flex ${
          colapsado ? "lg:w-20" : "lg:w-64"
        }`}
      >
        <div className={`mb-8 flex items-center px-2 ${colapsado ? "justify-center" : "justify-between"}`}>
          {!colapsado && (
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Turismo Colombia" className="h-14 w-auto object-contain" />
            </Link>
          )}
          <button
            onClick={() => setColapsado(!colapsado)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#087f8c] hover:bg-gray-100"
            title={colapsado ? "Expandir menú" : "Contraer menú"}
          >
            {colapsado ? "»" : "«"}
          </button>
        </div>

        {contenidoMenu(colapsado)}
      </aside>
    </>
  );
}

export default SidebarAdmin;