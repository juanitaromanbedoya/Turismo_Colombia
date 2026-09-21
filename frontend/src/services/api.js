const API_URL = "http://127.0.0.1:8000";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.detail || "Ocurrió un error en la petición.");
  }

  return datos;
}

export async function apiDescargar(endpoint, nombreArchivo) {
  const token = localStorage.getItem("token");

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!respuesta.ok) {
    let mensaje = "No se pudo descargar el archivo.";
    try {
      const datos = await respuesta.json();
      mensaje = datos.detail || mensaje;
    } catch {
      // la respuesta de error no venía en formato JSON
    }
    throw new Error(mensaje);
  }

  const blob = await respuesta.blob();
  const url = window.URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  window.URL.revokeObjectURL(url);
}