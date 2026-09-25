import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../services/api";

const MENSAJE_BIENVENIDA = {
  rol: "model",
  texto:
    "¡Hola! Soy el asistente de Turismo Colombia. Puedo ayudarte con información sobre nuestros servicios, el proceso de compra o registrar una petición, queja o reclamo. ¿En qué te ayudo?",
};

const MAX_HISTORIAL = 20;

// Convierte **negrita** simple a <strong>, sin librerías externas
function renderizarTexto(texto) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return partes.map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**")) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>;
    }
    return <span key={i}>{parte}</span>;
  });
}

function ChatbotWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const finRef = useRef(null);
  const [idConversacion, setIdConversacion] = useState(null);

  useEffect(() => {
    if (abierto) {
      finRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, abierto]);

  const enviar = async (e) => {
    e.preventDefault();
    const mensaje = texto.trim();
    if (!mensaje || enviando) return;

    const nuevos = [...mensajes, { rol: "user", texto: mensaje }];
    setMensajes(nuevos);
    setTexto("");
    setError("");
    setEnviando(true);

    try {
      // Solo se manda el historial real (sin el saludo inicial) y hasta el límite del backend
      const historial = nuevos
        .filter((m) => m !== MENSAJE_BIENVENIDA)
        .slice(0, -1)
        .slice(-MAX_HISTORIAL);

      const respuesta = await apiFetch("/api/chatbot/mensaje", {
        method: "POST",
        body: JSON.stringify({ mensaje, historial, id_conversacion: idConversacion }),
      });

      setIdConversacion(respuesta.id_conversacion);
      setMensajes((actuales) => [...actuales, { rol: "model", texto: respuesta.respuesta }]);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* ---------- Burbuja flotante ---------- */}
      <button
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? "Cerrar chat" : "Abrir chat"}
                className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#087f8c] text-2xl text-white shadow-xl transition hover:scale-105 hover:bg-[#006b75]"
      >
        {abierto ? "✕" : "💬"}
      </button>

      {/* ---------- Ventana del chat ---------- */}
      {abierto && (
        <div className="fixed top-28 bottom-40 right-6 z-50 flex w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-[#087f8c] px-4 py-3 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-300">
              Turismo Colombia
            </p>
            <p className="font-bold">Asistente virtual</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {mensajes.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    m.rol === "user"
                      ? "bg-[#087f8c] text-white"
                      : "bg-white text-gray-700 shadow"
                  }`}
                >
                  {renderizarTexto(m.texto)}
                </div>
              </div>
            ))}

            {enviando && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-white px-4 py-2 text-sm text-gray-400 shadow">
                  Escribiendo...
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 p-2 text-center text-xs font-semibold text-red-600">
                {error}
              </p>
            )}

            <div ref={finRef} />
          </div>

          <form onSubmit={enviar} className="flex items-center gap-2 border-t border-gray-100 p-3">
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={500}
              placeholder="Escribe tu mensaje..."
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#087f8c]"
            />
            <button
              type="submit"
              disabled={enviando || !texto.trim()}
              className="rounded-xl bg-[#087f8c] px-4 py-2 text-sm font-bold text-white hover:bg-[#006b75] disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;