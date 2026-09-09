// src/components/Input.jsx

function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-200"
            : "border-gray-300 focus:border-[#087f8c] focus:ring-2 focus:ring-[#087f8c]/20"
        }`}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;   