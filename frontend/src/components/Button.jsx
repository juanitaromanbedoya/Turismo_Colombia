// src/components/Button.jsx

function Button({ children, type = "button", onClick, disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg bg-[#087f8c] px-5 py-3 font-semibold text-white transition hover:bg-[#066b75] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export default Button;