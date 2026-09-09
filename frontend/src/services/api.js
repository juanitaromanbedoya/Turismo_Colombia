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