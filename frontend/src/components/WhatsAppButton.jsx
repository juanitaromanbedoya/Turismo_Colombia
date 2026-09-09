import { FaWhatsapp } from "react-icons/fa";

function WhatsAppButton() {
  const numeroWhatsApp = "573023121631";

  const mensaje = encodeURIComponent(
    "Hola, estoy interesado en los servicios de Turismo Colombia."
  );

  const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;

  return (
    <a
      href={enlaceWhatsApp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar a Turismo Colombia por WhatsApp"
      title="Contáctanos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition duration-300 hover:scale-110 hover:bg-[#20bd5a]"
    >
      <FaWhatsapp className="text-4xl" />
    </a>
  );
}

export default WhatsAppButton;