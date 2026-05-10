import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/lib/constants";
import { forgotPassword } from "@/api/auth.api";
import "@/styles/components/auth.css";
import "@/styles/components/ui.css";
import { Mail, Shield, Map, Key, AlertTriangle, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: "" },
  });

  const onSubmit = async (values) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await forgotPassword(values.email);
      setSuccess("Instructions to reset your password have been sent to your email.");
    } catch {
      setError("Failed to send reset link. Please check your email or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Left decorative panel ──────────────────────── */}
      <div className="auth-panel">
        <div className="auth-panel-brand">
          <Link to={ROUTES.landing} style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", textDecoration: "none" }}>
            <div className="auth-panel-logo-mark">TL</div>
            <span className="auth-panel-brand-name">Travel-Loop</span>
          </Link>
        </div>

        <div className="auth-panel-content">
          <h2 className="auth-panel-headline">
            Get back to<br />
            <span>exploring</span>
          </h2>
          <p className="auth-panel-desc">
            Enter your email and we'll send you instructions to reset your password. It's that simple.
          </p>

          <div className="auth-panel-features">
            {[
              { icon: <Mail size={24} />, text: "Secure reset link sent to your inbox" },
              { icon: <Shield size={24} />, text: "Safe and private password recovery" },
              { icon: <Map size={24} />, text: "Resume your travel planning in seconds" },
            ].map((f) => (
              <div key={f.text} className="auth-feature-item">
                <div className="auth-feature-icon">{f.icon}</div>
                <span className="auth-feature-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating deco cards */}
        <div className="auth-panel-deco">
          <div className="auth-deco-card">
            <div className="auth-deco-card-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Key size={16} /> Recovery</div>
            <div className="auth-deco-card-value">Fast & Secure</div>
          </div>
        </div>
      </div>

      {/* ── Right form side ────────────────────────────── */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <Link to={ROUTES.login} className="auth-form-back">
              ← Back to login
            </Link>
            <h1 className="auth-form-title">Reset password</h1>
            <p className="auth-form-subtitle">
              Enter your email address to receive a recovery link
            </p>
          </div>

          {error && (
            <div style={{
              background: "rgba(192,57,43,0.08)",
              border: "1px solid rgba(192,57,43,0.3)",
              borderRadius: "var(--br-md)",
              padding: "var(--sp-sm) var(--sp-md)",
              fontSize: "var(--fs-sm)",
              color: "var(--cl-error)",
              marginBottom: "var(--sp-md)",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><AlertTriangle size={16} /> {error}</span>
            </div>
          )}

          {success && (
            <div style={{
              background: "var(--cl-teal-light)",
              border: "1px solid var(--cl-teal)",
              borderRadius: "var(--br-md)",
              padding: "var(--sp-sm) var(--sp-md)",
              fontSize: "var(--fs-sm)",
              color: "#2D7A5A",
              marginBottom: "var(--sp-md)",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><CheckCircle size={16} /> {success}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="input-wrap">
              <label className="input-label" htmlFor="fp-email">Email address</label>
              <input
                id="fp-email"
                type="email"
                className={`input${errors.email ? " input-error" : ""}`}
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <span className="input-error-msg">{errors.email.message}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !!success}
              style={{ width: "100%", marginTop: "var(--sp-sm)" }}
            >
              {loading ? "Sending link…" : "Send Reset Link →"}
            </button>
          </form>

          <div className="auth-form-footer">
            <p className="auth-switch">
              Remembered your password?{" "}
              <Link to={ROUTES.login} className="auth-switch-link">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
