import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/lib/constants";
import { forgotPassword, resetPassword } from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/client";
import "@/styles/components/auth.css";
import "@/styles/components/ui.css";
import { AlertTriangle, CheckCircle, Eye, EyeOff, Key, Mail, Shield, Plane } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register: registerRequest,
    handleSubmit: handleRequestSubmit,
    watch: watchRequest,
    formState: { errors: requestErrors }
  } = useForm({ defaultValues: { email: "" } });
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch: watchReset,
    formState: { errors: resetErrors }
  } = useForm({ defaultValues: { otp: "", newPassword: "", confirmNewPassword: "" } });

  const sendOtp = async ({ email }) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(`A 6-digit OTP has been sent to ${email}. Check your inbox (and spam folder). Enter it below with your new password.`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const reset = async (values) => {
    setError("");
    setSuccess("");
    const email = watchRequest("email")?.trim();
    if (!email) {
      setError("Enter your email address before resetting your password.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email, otp: values.otp, newPassword: values.newPassword });
      setSuccess("Password reset complete! A confirmation email has been sent. You can now sign in with your new password.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-panel">
        <div className="auth-panel-brand">
          <Link to={ROUTES.landing} style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", textDecoration: "none" }}>
            <span className="auth-panel-brand-name">Travel<Plane size={32} style={{ display: "inline-block", marginInline: "4px", verticalAlign: "middle", color: "var(--cl-accent)" }} />Loop</span>
          </Link>
        </div>
        <div className="auth-panel-content">
          <h2 className="auth-panel-headline">Get back to<br /><span>exploring</span></h2>
          <p className="auth-panel-desc">The backend sends an OTP. Use it here to set a new password.</p>
          <div className="auth-panel-features">
            {[{ icon: <Mail size={24} />, text: "Request reset OTP" }, { icon: <Shield size={24} />, text: "Validate OTP securely" }, { icon: <Key size={24} />, text: "Set a strong new password" }].map((f) => (
              <div key={f.text} className="auth-feature-item"><div className="auth-feature-icon">{f.icon}</div><span className="auth-feature-text">{f.text}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <Link to={ROUTES.login} className="auth-form-back">Back to login</Link>
            <h1 className="auth-form-title">Reset password</h1>
            <p className="auth-form-subtitle">Request an OTP, then choose a new password.</p>
          </div>

          {error && <div style={{ color: "var(--cl-error)", marginBottom: "var(--sp-md)", display: "flex", gap: "var(--sp-xs)" }}><AlertTriangle size={16} /> {error}</div>}
          {success && <div style={{ color: "var(--cl-teal)", marginBottom: "var(--sp-md)", display: "flex", gap: "var(--sp-xs)" }}><CheckCircle size={16} /> {success}</div>}

          <form className="auth-form" onSubmit={handleRequestSubmit(sendOtp)}>
            <div className="input-wrap">
              <label className="input-label" htmlFor="fp-email">Email address</label>
              <input id="fp-email" type="email" className={`input${requestErrors.email ? " input-error" : ""}`} placeholder="you@example.com" {...registerRequest("email", { required: "Email is required" })} />
              {requestErrors.email && <span className="input-error-msg">{requestErrors.email.message}</span>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: "100%" }}>{loading ? "Sending..." : "Send OTP"}</button>
          </form>

          <form className="auth-form" onSubmit={handleResetSubmit(reset)} style={{ marginTop: "var(--sp-xl)" }}>
            <div className="input-wrap">
              <label className="input-label" htmlFor="fp-otp">OTP</label>
              <input id="fp-otp" inputMode="numeric" maxLength={6} className={`input${resetErrors.otp ? " input-error" : ""}`} placeholder="123456" {...registerReset("otp", { required: "OTP is required", pattern: { value: /^\d{6}$/, message: "Enter the 6-digit OTP" } })} />
              {resetErrors.otp && <span className="input-error-msg">{resetErrors.otp.message}</span>}
            </div>
            <div className="input-wrap">
              <label className="input-label" htmlFor="fp-new-password">New password</label>
              <div className="password-input-wrap">
                <input id="fp-new-password" type={showNewPassword ? "text" : "password"} className={`input password-input${resetErrors.newPassword ? " input-error" : ""}`} placeholder="NewPassword123" {...registerReset("newPassword", { required: "New password is required", minLength: { value: 8, message: "At least 8 characters" }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, message: "Must include uppercase, lowercase, and number" } })} />
                <button type="button" className="password-toggle" onClick={() => setShowNewPassword((value) => !value)} aria-label={showNewPassword ? "Hide password" : "Show password"}>
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {resetErrors.newPassword && <span className="input-error-msg">{resetErrors.newPassword.message}</span>}
            </div>
            <div className="input-wrap">
              <label className="input-label" htmlFor="fp-confirm-password">Confirm new password</label>
              <div className="password-input-wrap">
                <input id="fp-confirm-password" type={showConfirmPassword ? "text" : "password"} className={`input password-input${resetErrors.confirmNewPassword ? " input-error" : ""}`} placeholder="Repeat new password" {...registerReset("confirmNewPassword", { required: "Please confirm your new password", validate: (value) => value === watchReset("newPassword") || "Passwords do not match" })} />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {resetErrors.confirmNewPassword && <span className="input-error-msg">{resetErrors.confirmNewPassword.message}</span>}
            </div>
            <button type="submit" className="btn btn-secondary btn-lg" disabled={loading} style={{ width: "100%" }}>Reset Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}
