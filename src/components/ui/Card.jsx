import "@/styles/components/ui.css";

export function Card({ children, variant = "default", hover = false, className = "" }) {
  const variantClass = variant === "surface" ? "card-surface" : "card";
  const hoverClass = hover ? "card-hover" : "";
  
  return (
    <div className={`${variantClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
