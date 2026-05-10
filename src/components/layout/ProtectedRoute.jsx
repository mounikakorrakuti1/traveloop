import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";

/** Guards all protected routes — redirects to /login if not authenticated */
export function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated     = useAuthStore((s) => s.hasHydrated);
  const location        = useLocation();

  if (!hasHydrated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--cl-bg)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "3rem", height: "3rem",
            border: "3px solid var(--cl-border)",
            borderTopColor: "var(--cl-accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
            Loading…
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return children;
}
