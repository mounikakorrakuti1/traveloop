import "@/styles/components/ui.css";

export function Badge({ children, variant = "ghost", className = "" }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}
