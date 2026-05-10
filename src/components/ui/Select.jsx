import "@/styles/components/ui.css";

export function Select({ 
  label, 
  id, 
  error, 
  options = [], 
  className = "", 
  placeholder,
  ...props 
}) {
  return (
    <div className="input-wrap">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <select 
        id={id}
        className={`input ${error ? "input-error" : ""} ${className}`}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}
