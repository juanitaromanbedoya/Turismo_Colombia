// src/components/Footer.jsx

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#004f54] text-white">

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">

        {/* INFORMACIÓN */}
        <div>
          <h2 className="text-2xl font-extrabold text-[#f4b942]">
            Turismo Colombia
          </h2>

          <p className="mt-4 max-w-sm leading-relaxed text-white/70">
            Descubre la belleza, cultura y diversidad de Colombia a través
            de sus destinos, paisajes y experiencias.
          </p>
        </div>

        {/* ENLACES */}
        <div>
          <h3 className="text-lg font-bold">
            Explora
          </h3>

          <div className="mt-4 flex flex-col gap-3">

            <Link
              to="/"
              className="text-white/70 transition hover:text-[#f4b942]"
            >
              Inicio
            </Link>

            <Link
              to="/destinos"
              className="text-white/70 transition hover:text-[#f4b942]">
              Destinos
            </Link>

            <Link 
            to ="/Servicios"
            className="text-white/70 transition hover:text-[#f4b942]">
              Servicios
              </Link>

            <Link
              to="/quienes-somos"
              className="text-white/70 transition hover:text-[#f4b942]"
            >
              Nosotros
            </Link>

            <Link
              to="/contacto"
              className="text-white/70 transition hover:text-[#f4b942]"
            >
              Contacto
            </Link>

          </div>
        </div>

        {/* CONTACTO */}
        <div>
          <h3 className="text-lg font-bold">
            Contáctanos
          </h3>

          <div className="mt-4 space-y-3 text-white/70">
            <p>📍 Colombia</p>
            <p>✉️ contacto@turismocolombia.com</p>
            <p>📞 +57 300 000 0000</p>
          </div>
        </div>

      </div>

      {/* PARTE INFERIOR */}
      <div className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-center text-sm text-white/60 md:flex-row md:items-center md:justify-between md:text-left">

          <p>
            © 2026 Turismo Colombia. Todos los derechos reservados.
          </p>

          <p>
            Hecho con ❤️ para mostrar lo mejor de Colombia.
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;