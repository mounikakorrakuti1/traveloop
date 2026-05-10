import { createContext, useCallback, useContext, useMemo, useState } from "react";
import "@/styles/components/ui.css";
import { AlertTriangle, CheckCircle } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div 
        style={{
          position: "fixed",
          bottom: "var(--sp-xl)",
          right: "var(--sp-xl)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "var(--sp-sm)",
          pointerEvents: "none",
        }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              pointerEvents: "auto",
              padding: "var(--sp-sm) var(--sp-lg)",
              borderRadius: "var(--br-lg)",
              fontSize: "var(--fs-sm)",
              fontWeight: "var(--fw-medium)",
              boxShadow: "var(--shadow-lg)",
              animation: "fadeUp 0.3s var(--tr-slow) both",
              minWidth: "15rem",
              maxWidth: "25rem",
              background: t.variant === "error" ? "var(--cl-error)" : t.variant === "success" ? "var(--cl-teal)" : "var(--cl-surface)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: "var(--sp-xs)"
            }}
          >
            {t.variant === "error" && <AlertTriangle size={14} />}
            {t.variant === "success" && <CheckCircle size={14} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
