import { Component } from "react";
import "@/styles/components/ui.css";
import { AlertTriangle } from "lucide-react";

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{
            padding: "var(--sp-2xl)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--sp-md)",
            background: "var(--cl-bg)",
            minHeight: "40vh",
            justifyContent: "center"
          }}>
            <div style={{ color: "var(--cl-error)" }}><AlertTriangle size={48} /></div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "var(--fw-bold)", color: "var(--cl-text)" }}>
              Something went wrong
            </h2>
            <p style={{ color: "var(--cl-error)", fontSize: "var(--fs-sm)", maxWidth: "var(--max-w-xs)" }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Reload Component
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
