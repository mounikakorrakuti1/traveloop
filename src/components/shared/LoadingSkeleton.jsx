import "@/styles/components/ui.css";

export function LoadingSkeleton({ className, lines = 3 }) {
  return (
    <div 
      className={`skeleton-wrap ${className || ""}`}
      style={{ display: "flex", flexDirection: "column", gap: "var(--sp-sm)" }}
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="skeleton" 
          style={{ height: "1.25rem", width: i === lines - 1 ? "60%" : "100%" }} 
        />
      ))}
    </div>
  );
}
