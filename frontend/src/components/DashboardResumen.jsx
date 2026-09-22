import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../services/api";
import ListaIndicador from "./ListaIndicador";

const ESTILO_DEFECTO = {
  icono: "📊",
  fondo: "bg-gray-100",
  barra: "bg-gray-400",
  valor: "text-[#087f8c]",
};

const ESTILOS = {
  usuarios: { icono: "👥", fondo: "bg-teal-50", barra: "bg-teal-500", valor: "text-[#087f8c]" },
  servicios: { icono: "🛎️", fondo: "bg-amber-50", barra: "bg-amber-400", valor: "text-amber-600" },
  servicios_activos: { icono: "🛎️", fondo: "bg-amber-50", barra: "bg-amber-400", valor: "text-amber-600" },
  ventas: { icono: "🧾", fondo: "bg-blue-50", barra: "bg-blue-500", valor: "text-blue-600" },
  compras: { icono: "🛒", fondo: "bg-blue-50", barra: "bg-blue-500", valor: "text-blue-600" },
  total_vendido: { icono: "💰", fondo: "bg-green-50", barra: "bg-green-500", valor: "text-green-600" },
  gastado: { icono: "💰", fondo: "bg-green-50", barra: "bg-green-500", valor: "text-green-600" },
  facturacion: { icono: "📑", fondo: "bg-purple-50", barra: "bg-purple-500", valor: "text-purple-600" },
  facturas: { icono: "📑", fondo: "bg-purple-50", barra: "bg-purple-500", valor: "text-purple-600" },
  pqr_recibidas: { icono: "💬", fondo: "bg-indigo-50", barra: "bg-indigo-500", valor: "text-indigo-600" },
  pqr_pendientes: { icono: "⏳", fondo: "bg-yellow-50", barra: "bg-yellow-400", valor: "text-yellow-600" },
};

const formatoPesos = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor));

// Número que sube (o baja) de forma animada hasta su valor real
function useContador(objetivo, duracion = 900) {
  const [valor, setValor] = useState(0);
  const desdeRef = useRef(0);

  useEffect(() => {
    const desde = desdeRef.current;
    const inicio = performance.now();
    let frame;

    const paso = (ahora) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1);
      const suavizado = 1 - Math.pow(1 - progreso, 3);
      const actual = desde + (objetivo - desde) * suavizado;
      desdeRef.current = actual;
      setValor(actual);
      if (progreso < 1) frame = requestAnimationFrame(paso);
    };

    frame = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(frame);
  }, [objetivo, duracion]);

  return valor;
}

function TarjetaIndicador({ t, indice, onVerLista }) {
  const [visible, setVisible] = useState(false);
  const animado = useContador(t.valor);
  const estilo = ESTILOS[t.clave] || ESTILO_DEFECTO;
  const alerta = t.clave === "pqr_pendientes" && t.valor > 0;

  // Entrada escalonada: cada tarjeta aparece un poco después de la anterior
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), indice * 80);
    return () => clearTimeout(id);
  }, [indice]);

  const numero = Math.round(animado);

  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${alerta ? "ring-2 ring-yellow-300" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-gray-500">{t.titulo}</p>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${estilo.fondo}`}
        >
          {estilo.icono}
        </div>
      </div>

      <p className={`mt-1 whitespace-nowrap text-3xl font-extrabold ${estilo.valor}`}>
        {t.formato === "moneda" ? formatoPesos(numero) : numero.toLocaleString("es-CO")}
      </p>

      {t.porcentaje != null && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${estilo.barra}`}
              style={{ width: visible ? `${t.porcentaje}%` : "0%" }}
            />
          </div>
          <p className="mt-1 text-xs font-semibold text-gray-500">
            {Math.round(t.porcentaje)}% {t.etiqueta_porcentaje}
          </p>
        </div>
      )}

      {t.detalle && (
        <p className="mt-3 whitespace-pre-line text-sm text-gray-500">{t.detalle}</p>
      )}

      {t.lista && t.lista.length > 0 && (
        <button
          onClick={() => onVerLista(t.clave)}
          className="mt-3 rounded-lg bg-[#087f8c] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#006b75]"
        >
          Ver lista ({t.lista.length})
        </button>
      )}

      {alerta && (
        <span className="mt-3 inline-block animate-pulse rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
          ⚠ Requiere atención
        </span>
      )}
    </div>
  );
}

function DashboardResumen() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [actualizado, setActualizado] = useState(null);
  const [claveLista, setClaveLista] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await apiFetch("/api/estadisticas/resumen");
      setResumen(datos);
      setError("");
      setActualizado(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial y actualización automática cada minuto
  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 60000);
    return () => clearInterval(id);
  }, [cargar]);

  if (!resumen && !error) {
    return (
      <p className="rounded-2xl bg-white p-6 text-center font-semibold text-[#087f8c] shadow-lg">
        Cargando indicadores...
      </p>
    );
  }

  if (!resumen) {
    return (
      <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>
    );
  }

  // La ventana se alimenta de la última respuesta, así se actualiza con el refresco
  const tarjetaLista = claveLista
    ? resumen.tarjetas.find((t) => t.clave === claveLista)
    : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          {actualizado &&
            `Actualizado a las ${actualizado.toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
            })} · se actualiza cada minuto`}
        </p>
        <button
          onClick={cargar}
          disabled={cargando}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className={cargando ? "inline-block animate-spin" : "inline-block"}>↻</span>{" "}
          Actualizar
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {resumen.tarjetas.map((t, i) => (
          <TarjetaIndicador key={t.clave} t={t} indice={i} onVerLista={setClaveLista} />
        ))}
      </div>

      {tarjetaLista && (
        <ListaIndicador tarjeta={tarjetaLista} onCerrar={() => setClaveLista(null)} />
      )}
    </div>
  );
}

export default DashboardResumen;