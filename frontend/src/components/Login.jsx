
import { apiFetch } from "../services/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "./Input";
import Button from "./Button";
import RegisterModal from "./RegisterModal"

function Login({ setUsuario })  {
  const navigate = useNavigate();
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [formulario, setFormulario] = useState({
    correo: "",
    contrasena: "",
    recordarme: false,
  });

  const [errores, setErrores] = useState({});

  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const validarCorreo = (correo) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.correo.trim()) {
      nuevosErrores.correo = "El correo electrónico es obligatorio.";
    } else if (!validarCorreo(formulario.correo)) {
      nuevosErrores.correo = "Ingresa un correo electrónico válido.";
    }

    if (!formulario.contrasena) {
      nuevosErrores.contrasena = "La contraseña es obligatoria.";
    } else if (formulario.contrasena.length < 6) {
      nuevosErrores.contrasena =
        "La contraseña debe tener mínimo 6 caracteres.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
    });

    setErrores({
      ...errores,
      [name]: "",
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validarFormulario()) {
    return;
  }

  try {
    const datos = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        correo: formulario.correo,
        contrasena: formulario.contrasena,
      }),
    });

    localStorage.setItem("token", datos.access_token);
    localStorage.setItem("usuario", JSON.stringify(datos.usuario));

    setUsuario(datos.usuario);

    window.dispatchEvent(new Event("auth-cambio"));

    toast.success("Inicio de sesión exitoso.");

    if (datos.usuario.rol === "Administrador") {
      navigate("/panel-administrador");
    } else if (datos.usuario.rol === "Empleado") {
      navigate("/panel-empleado");
    } else {
      navigate("/");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    toast.error(error.message || "Correo o contraseña incorrectos.");
  }
};

  return (

    
    <section className="flex min-h-[calc(100vh-160px)] items-center justify-center bg-[#f8f6ef] px-4 py-12">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

        <div className="hidden bg-[#004f54] p-12 text-white md:flex md:flex-col md:justify-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#f4b942]">
            Vive Colombia
          </p>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight">
            Descubre lugares increíbles.
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-white/80">
            Inicia sesión y continúa explorando los destinos, experiencias
            y maravillas que Colombia tiene para ofrecerte.
          </p>

          <div className="mt-8 h-1 w-16 rounded-full bg-[#f4b942]" />
        </div>

        <div className="p-8 sm:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-[#087f8c]">
              Iniciar sesión
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Ingresa tus datos para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <Input
              label="Correo electrónico"
              name="correo"
              type="email"
              value={formulario.correo}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              error={errores.correo}
            />

            <div className="relative">
              <Input
                label="Contraseña"
                name="contrasena"
                type={mostrarContrasena ? "text" : "password"}
                value={formulario.contrasena}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                error={errores.contrasena}
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarContrasena(!mostrarContrasena)
                }
                className="absolute right-4 top-9 text-gray-500 hover:text-[#087f8c]"
                aria-label={
                  mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarContrasena ? "◉" : "◉"}
              </button>
            </div>

            <div className="mb-6 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="recordarme"
                  checked={formulario.recordarme}
                  onChange={handleChange}
                  className="h-4 w-4 accent-[#087f8c]"
                />

                Recordarme
              </label>

              <button
                type="button"
                onClick={() => navigate("/recuperar-password")}
                className="text-sm font-medium text-[#087f8c] hover:text-[#f4b942]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button type="submit">
              Iniciar sesión
            </Button>

          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">o</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Aún no tienes una cuenta?
            </p>

            <button
              type="button"
              onClick={() => setMostrarRegistro(true)}
              className="mt-2 font-bold text-[#087f8c] hover:text-[#f4b942]"
            >
                Crear una cuenta
            </button>
          </div>

        </div>
      </div>
      {mostrarRegistro && (
  <RegisterModal
    onClose={() => setMostrarRegistro(false)}
  />
)}
    </section>
  );
}

export default Login;