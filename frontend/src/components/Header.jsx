import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.svg";
import { useState, useEffect, useRef } from "react";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const menuRef = useRef(null);

  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  useEffect(() => {
    const actualizarUsuario = () => {
      const usuarioGuardado = localStorage.getItem("usuario");
      setUsuario(usuarioGuardado ? JSON.parse(usuarioGuardado) : null);
    };

    window.addEventListener("auth-cambio", actualizarUsuario);
    return () => window.removeEventListener("auth-cambio", actualizarUsuario);
  }, []);

  useEffect(() => {
    const manejarClicAfuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClicAfuera);
    return () => document.removeEventListener("mousedown", manejarClicAfuera);
  }, []);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setMenuMovilAbierto(false);
  }, [location.pathname]);

  const linkClass = (ruta) =>
    `relative font-semibold text-sm tracking-wide transition-colors pb-1 ${
      location.pathname === ruta
        ? "text-[#087f8c]"
        : "text-gray-600 hover:text-[#087f8c]"
    } after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:rounded-full after:transition-all after:duration-300 ${
      location.pathname === ruta
        ? "after:w-full after:bg-[#f4b942]"
        : "after:w-0 hover:after:w-full after:bg-[#f4b942]"
    }`;

  const linkClassMovil = (ruta) =>
    `block rounded-xl px-4 py-3 font-semibold ${
      location.pathname === ruta
        ? "bg-[#087f8c]/10 text-[#087f8c]"
        : "text-gray-600 hover:bg-gray-50"
    }`;

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
    setMenuAbierto(false);
    window.dispatchEvent(new Event("auth-cambio"));
    navigate("/");
  };

  const verPanel = () => {
    setMenuAbierto(false);
    setMenuMovilAbierto(false);
    if (!usuario) {
      navigate("/login");
      return;
    }
    if (usuario.rol === "Administrador") navigate("/panel-administrador");
    else if (usuario.rol === "Empleado") navigate("/panel-empleado");
    else if (usuario.rol === "Cliente") navigate("/panel-cliente");
  };

  const enlaces = [
    { ruta: "/", etiqueta: "Inicio" },
    { ruta: "/destinos", etiqueta: "Destinos" },
    { ruta: "/Servicios", etiqueta: "Servicios" },
    { ruta: "/quienes-somos", etiqueta: "Nosotros" },
    { ruta: "/contacto", etiqueta: "Contacto" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-10 lg:py-4">

        {/* LOGO */}
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="Turismo Colombia"
            className="h-12 w-auto object-contain md:h-16"
          />
        </Link>

        {/* MENÚ DE ESCRITORIO */}
        <div className="hidden items-center gap-x-8 lg:flex">
          {enlaces.map((enlace) => (
            <Link key={enlace.ruta} to={enlace.ruta} className={linkClass(enlace.ruta)}>
              {enlace.etiqueta}
            </Link>
          ))}

          {!usuario && (
            <Link
              to="/login"
              className="rounded-xl bg-[#087f8c] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#006b75] hover:shadow-md"
            >
              Iniciar sesión
            </Link>
          )}

          {usuario && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="flex items-center gap-2 rounded-2xl bg-gray-50 py-1.5 pl-2 pr-3 transition hover:bg-gray-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087f8c] text-sm font-bold text-white">
                  {usuario.nombre?.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-sm font-semibold text-gray-700 xl:block">
                  Bienvenido, {usuario.nombre}
                </span>
                <svg
                  className={`h-4 w-4 text-gray-500 transition-transform ${menuAbierto ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuAbierto && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  <button
                    onClick={verPanel}
                    className="block w-full px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Ver mi cuenta
                  </button>
                  <button
                    onClick={cerrarSesion}
                    className="block w-full border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTÓN HAMBURGUESA (solo móvil/tablet) */}
        <button
          onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#087f8c] lg:hidden"
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
      </nav>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuMovilAbierto && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {enlaces.map((enlace) => (
              <Link key={enlace.ruta} to={enlace.ruta} className={linkClassMovil(enlace.ruta)}>
                {enlace.etiqueta}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            {!usuario ? (
              <Link
                to="/login"
                className="block rounded-xl bg-[#087f8c] px-4 py-3 text-center font-bold text-white"
              >
                Iniciar sesión
              </Link>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087f8c] text-sm font-bold text-white">
                    {usuario.nombre?.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    Bienvenido, {usuario.nombre}
                  </span>
                </div>
                <button
                  onClick={verPanel}
                  className="block w-full rounded-xl px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-50"
                >
                  Ver mi cuenta
                </button>
                <button
                  onClick={cerrarSesion}
                  className="block w-full rounded-xl px-4 py-3 text-left font-medium text-red-500 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;