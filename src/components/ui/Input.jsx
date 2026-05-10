import "@/styles/components/ui.css";

export function Input({ 
  label, 
  id, 
  error, 
  className = "", 
  variant = "default", 
  ...props 
}) {
  const inputClass = variant === "on-surface" ? "input-on-surface" : "input";
  
  return (
    <div className="input-wrap">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <input 
        id={id}
        className={`${inputClass} ${error ? "input-error" : ""} ${className}`}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
}
