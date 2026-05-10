import "@/styles/components/ui.css";
import { Search } from "lucide-react";

export function EmptyState({ title, description, action, icon = <Search size={48} /> }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h2 className="empty-state-title">{title}</h2>
      {description && (
        <p style={{ marginTop: "var(--sp-xs)", maxWidth: "var(--max-w-xs)", fontSize: "var(--fs-sm)", color: "var(--cl-text-muted)" }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: "var(--sp-md)" }}>
          {action}
        </div>
      )}
    </div>
  );
}
