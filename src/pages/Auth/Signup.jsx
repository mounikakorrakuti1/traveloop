import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { register as apiRegister } from "@/api/auth.api";
import "@/styles/components/auth.css";
import "@/styles/components/ui.css";
import { Rocket, Lock, Sparkles, Globe, Users, Plane, AlertTriangle, Luggage, HeartHandshake, Camera, User } from "lucide-react";

export default function SignupPage() {
  const navigate  = useNavigate();
  const setUser   = useAuthStore((s) => s.setUser);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    defaultValues: {
      firstName: "", lastName: "", email: "",
      password: "", confirmPassword: "", travelerProfile: "solo",
      avatarUrl: "",
    },
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Using a generic preset or one from env if possible
    formData.append("cloud_name", "dmutdl3z7");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dmutdl3z7/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed", err);
      return null;
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["firstName", "email", "password", "confirmPassword"]);
      if (valid) setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const onSubmit = async (values) => {
    setError("");
    setLoading(true);
    try {
      let finalAvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + values.firstName;
      
      if (imageFile) {
        const uploadedUrl = await uploadToCloudinary(imageFile);
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      const user = await apiRegister({
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        avatarUrl: finalAvatarUrl,
        travelerProfile: values.travelerProfile,
      });
      setUser(user);
      navigate(ROUTES.home, { replace: true });
    } catch {
      setError("Registration failed. Please check your details and try again.");
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
            Join thousands of<br />
            <span>explorers</span>
          </h2>
          <p className="auth-panel-desc">
            Create your free account and start planning trips that turn into unforgettable stories.
          </p>

          <div className="auth-panel-features">
            {[
              { icon: <Rocket size={24} />, text: "Free forever for personal use" },
              { icon: <Lock size={24} />, text: "Your data is private and secure" },
              { icon: <Sparkles size={24} />, text: "AI features included from day one" },
              { icon: <Globe size={24} />, text: "Access from any device, anywhere" },
            ].map((f) => (
              <div key={f.text} className="auth-feature-item">
                <div className="auth-feature-icon">{f.icon}</div>
                <span className="auth-feature-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-panel-deco">
          <div className="auth-deco-card">
            <div className="auth-deco-card-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Users size={16} /> Community</div>
            <div className="auth-deco-card-value">10k+ Travellers</div>
          </div>
          <div className="auth-deco-card">
            <div className="auth-deco-card-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Plane size={16} /> Trips Planned</div>
            <div className="auth-deco-card-value">50k+</div>
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
            <h1 className="auth-form-title">
              {step === 1 ? "Create your account" : step === 2 ? "Your travel style" : "Personalise your profile"}
            </h1>
            <p className="auth-form-subtitle">
              {step === 1
                ? "It's free and takes less than a minute"
                : step === 2 
                ? "Help us personalise your experience"
                : "Add a profile picture (optional)"}
            </p>
          </div>

          {/* Step indicator */}
          <div className="auth-steps">
            <div className={`auth-step-dot ${step >= 1 ? "active" : ""}`} />
            <div style={{ flex: 1, height: "1px", background: "var(--cl-border)" }} />
            <div className={`auth-step-dot ${step >= 2 ? "active" : ""}`} />
            <div style={{ flex: 1, height: "1px", background: "var(--cl-border)" }} />
            <div className={`auth-step-dot ${step === 3 ? "active" : ""}`} />
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
            {step === 1 && (
              <>
                <div className="auth-form-row">
                  <div className="input-wrap">
                    <label className="input-label" htmlFor="signup-fname">First Name</label>
                    <input
                      id="signup-fname"
                      className={`input${errors.firstName ? " input-error" : ""}`}
                      placeholder="Priya"
                      {...register("firstName", { required: "Required" })}
                    />
                    {errors.firstName && <span className="input-error-msg">{errors.firstName.message}</span>}
                  </div>
                  <div className="input-wrap">
                    <label className="input-label" htmlFor="signup-lname">Last Name</label>
                    <input
                      id="signup-lname"
                      className="input"
                      placeholder="Sharma"
                      {...register("lastName")}
                    />
                  </div>
                </div>

                <div className="input-wrap">
                  <label className="input-label" htmlFor="signup-email">Email address</label>
                  <input
                    id="signup-email"
                    type="email"
                    className={`input${errors.email ? " input-error" : ""}`}
                    placeholder="you@example.com"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && <span className="input-error-msg">{errors.email.message}</span>}
                </div>
                <div className="input-wrap">
                  <label className="input-label" htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    className={`input${errors.password ? " input-error" : ""}`}
                    placeholder="At least 8 characters"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "At least 8 characters" },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                        message: "Must include uppercase, lowercase, and number"
                      }
                    })}
                  />
                  {errors.password && <span className="input-error-msg">{errors.password.message}</span>}
                </div>

                <div className="input-wrap">
                  <label className="input-label" htmlFor="signup-confirm-password">Confirm Password</label>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    className={`input${errors.confirmPassword ? " input-error" : ""}`}
                    placeholder="Repeat your password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (val) => {
                        if (watch('password') !== val) {
                          return "Passwords do not match";
                        }
                      },
                    })}
                  />
                  {errors.confirmPassword && <span className="input-error-msg">{errors.confirmPassword.message}</span>}
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={nextStep}
                  style={{ width: "100%", marginTop: "var(--sp-sm)" }}
                >
                  Continue →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="input-wrap">
                  <label className="input-label">What kind of traveller are you?</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-sm)" }}>
                    {[
                      { value: "solo",    icon: Luggage, label: "Solo Explorer" },
                      { value: "couple",  icon: HeartHandshake, label: "Couple" },
                      { value: "family",  icon: Users, label: "Family" },
                      { value: "group",   icon: Users, label: "Group" },
                    ].map((t) => {
                      const selected = watch("travelerProfile") === t.value;
                      return (
                        <label
                          key={t.value}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "var(--sp-xs)",
                            padding: "var(--sp-md)",
                            borderRadius: "var(--br-lg)",
                            border: `2px solid ${selected ? "var(--cl-accent)" : "var(--cl-border)"}`,
                            background: selected ? "var(--cl-accent-light)" : "var(--cl-bg-alt)",
                            cursor: "pointer",
                            transition: "all var(--tr-fast)",
                            fontSize: "var(--fs-xs)",
                            fontWeight: "var(--fw-semibold)",
                            color: selected ? "var(--cl-accent)" : "var(--cl-text-muted)",
                          }}
                        >
                          <input
                            type="radio"
                            value={t.value}
                            style={{ display: "none" }}
                            {...register("travelerProfile")}
                          />
                          <span style={{ display: "flex", color: selected ? "var(--cl-accent)" : "var(--cl-text-muted)" }}><t.icon size={28} /></span>
                          {t.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "var(--sp-md)", marginTop: "var(--sp-sm)" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setStep(1)}
                    style={{ flex: 1 }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                    style={{ flex: 2 }}
                  >
                    Continue →
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="avatar-upload-container">
                  <div className={`avatar-preview-wrap ${imagePreview ? "has-image" : ""}`}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="avatar-preview-img" />
                    ) : (
                      <User size={48} color="var(--cl-text-subtle)" />
                    )}
                    <label htmlFor="avatar-input" className="avatar-upload-btn">
                      <Camera size={16} />
                    </label>
                  </div>
                  <input
                    id="avatar-input"
                    type="file"
                    className="avatar-upload-input"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", textAlign: "center", maxWidth: "18rem" }}>
                    Selected images will be used as your profile picture. This step is optional.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "var(--sp-md)", marginTop: "var(--sp-sm)" }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setStep(2)}
                    style={{ flex: 1 }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ flex: 2 }}
                  >
                    {loading ? "Creating account…" : <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", justifyContent: "center" }}>Create Account <Rocket size={16} /></span>}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="auth-form-footer">
            <p className="auth-switch">
              Already have an account?{" "}
              <Link to={ROUTES.login} className="auth-switch-link">Sign in →</Link>
            </p>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-subtle)", textAlign: "center" }}>
              By signing up you agree to our{" "}
              <a href="#" style={{ color: "var(--cl-accent)" }}>Terms</a> and{" "}
              <a href="#" style={{ color: "var(--cl-accent)" }}>Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
