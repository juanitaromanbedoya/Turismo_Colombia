import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";

import Index from "./pages/Index";
import Destinos from "./pages/Destinos";
import Contacto from "./pages/Contacto";
import QuienesSomos from "./pages/quienes-somos";
import Login from "./components/Login";
import Servicios from "./pages/Servicios";
import RecuperarPassword from "./pages/RecuperarPassword";
import PanelAdministrador from "./pages/PanelAdministrador";
import PanelEmpleado from "./pages/PanelEmpleado";
import PanelCliente from "./pages/PanelCliente";
import RutaProtegida from "./components/RutaProtegida";
import WhatsAppButton from "./components/WhatsAppButton";
import RestablecerPassword from "./pages/RestablecerPassword";
import SidebarAdmin from "./components/SidebarAdmin";
import ServicioDetalle from "./pages/ServicioDetalle";

function App() {
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const esGestion = usuario && (usuario.rol === "Administrador" || usuario.rol === "Empleado");

  return (
    <BrowserRouter>
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      fontWeight: "600",
      fontSize: "16px",
      padding: "16px 20px",
      borderRadius: "12px",
      maxWidth: "420px",
    },
    success: {
      duration: 4000,
      style: {
        background: "#087f8c",
        color: "#fff",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#087f8c",
      },
    },
    error: {
      duration: 6000,
      style: {
        background: "#dc2626",
        color: "#fff",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#dc2626",
      },
    },
  }}
/>
    {esGestion ? (
        <SidebarAdmin usuario={usuario} setUsuario={setUsuario} />
      ) : (
        <Header />
      )}

        <main className={esGestion ? "lg:pl-64" : ""}>
    
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="/destinos" element={<Destinos />} />

          <Route path="/contacto" element={<Contacto />} />

          <Route path="/quienes-somos" element={<QuienesSomos />} />

          <Route path="/login"  element={<Login setUsuario={setUsuario} />} />

          <Route path="/Servicios" element={ <RutaProtegida>
                <Servicios />
              </RutaProtegida> } />
          <Route path="/servicios/:id" element={<ServicioDetalle />} />

          <Route path="/panel-administrador" element={ <RutaProtegida rolesPermitidos={["Administrador"]}>
                <PanelAdministrador />
              </RutaProtegida> } />

          <Route path="/panel-empleado" element={ <RutaProtegida rolesPermitidos={["Empleado"]}> <PanelEmpleado />
              </RutaProtegida> } />

          <Route
            path="/panel-cliente"
            element={
              <RutaProtegida rolesPermitidos={["Cliente"]}>
                <PanelCliente />
              </RutaProtegida>
            }
          />

          <Route
            path="/recuperar-password"
            element={<RecuperarPassword />}
          />

          <Route
            path="/restablecer-password"
            element={<RestablecerPassword />}
          />

        </Routes>
      </main>
       <WhatsAppButton />
      <Footer />
    </BrowserRouter>
  );
}

export default App;