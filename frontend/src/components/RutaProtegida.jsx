import { Navigate } from "react-router-dom";

function RutaProtegida({ children, rolesPermitidos, mensajeRedireccion }) {
  const token = localStorage.getItem("token");
  const usuarioGuardado = localStorage.getItem("usuario");

  if (!token || !usuarioGuardado) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ mensaje: mensajeRedireccion }}
      />
    );
  }

  const usuario = JSON.parse(usuarioGuardado);

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaProtegida;