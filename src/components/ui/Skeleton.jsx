import "@/styles/components/ui.css";

export function Skeleton({ className = "", style = {} }) {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ ...style }}
    />
  );
}
