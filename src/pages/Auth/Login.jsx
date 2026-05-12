import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { login } from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/client";
import "@/styles/components/auth.css";
import "@/styles/components/ui.css";
import { Map, Banknote, Luggage, Globe, Plane, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const setUser   = useAuthStore((s) => s.setUser);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    setError("");
    setLoading(true);
    try {
      const user = await login(values);
      setUser(user);
      const from = location.state?.from || ROUTES.home;
      navigate(from, { replace: true });
    } catch (error) {
      setError(getApiErrorMessage(error));
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
            <span className="auth-panel-brand-name">Travel<Plane size={32} style={{ display: "inline-block", marginInline: "4px", verticalAlign: "middle", color: "var(--cl-accent)" }} />Loop</span>
          </Link>
        </div>

        <div className="auth-panel-content">
          <h2 className="auth-panel-headline">
            Your journeys,<br />
            beautifully <span>organised</span>
          </h2>
          <p className="auth-panel-desc">
            Plan itineraries, track budgets, pack smarter, and share your adventures with a community of explorers.
          </p>

          <div className="auth-panel-features">
            {[
              { icon: <Map size={24} />, text: "Smart itinerary builder with drag-and-drop stops" },
              { icon: <Banknote size={24} />, text: "Real-time budget tracking and AI estimates" },
              { icon: <Luggage size={24} />, text: "AI-powered packing lists for every destination" },
              { icon: <Globe size={24} />, text: "Share trips with the Travel-Loop community" },
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
            <div className="auth-deco-card-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Plane size={16} /> Next Trip</div>
            <div className="auth-deco-card-value">Goa Escape</div>
          </div>
          <div className="auth-deco-card">
            <div className="auth-deco-card-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Banknote size={16} /> Budget Left</div>
            <div className="auth-deco-card-value">₹16,800</div>
          </div>
        </div>
      </div>

      {/* ── Right form side ────────────────────────────── */}
      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <Link to={ROUTES.landing} className="auth-form-back">
              ← Back to home
            </Link>
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">
              Sign in to continue planning your adventures
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

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="input-wrap">
              <label className="input-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className={`input${errors.email ? " input-error" : ""}`}
                placeholder="you@example.com"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <span className="input-error-msg">{errors.email.message}</span>}
            </div>

            <div className="input-wrap">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="input-label" htmlFor="login-password">Password</label>
                <Link to={ROUTES.forgotPassword} style={{ fontSize: "var(--fs-xs)", color: "var(--cl-accent)" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="password-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className={`input password-input${errors.password ? " input-error" : ""}`}
                  placeholder="Your password"
                  {...register("password", { required: "Password is required" })}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="input-error-msg">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "var(--sp-sm)" }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", margin: "var(--sp-md) 0" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--cl-border)" }} />
              <span style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-subtle)" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "var(--cl-border)" }} />
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => {
                const values = { email: "tester@traveloop.test", password: "Password123" };
                onSubmit(values);
              }}
              style={{
                width: "100%",
                background: "rgba(129, 178, 154, 0.1)",
                borderColor: "rgba(129, 178, 154, 0.3)",
                color: "var(--cl-success)"
              }}
            >
              Try Guest Account
            </button>
          </form>

          <div className="auth-form-footer">
            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to={ROUTES.signup} className="auth-switch-link">
                Create one free →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
