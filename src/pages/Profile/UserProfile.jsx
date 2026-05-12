import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAccount,
  logout,
  requestDeleteAccountOtp,
  requestProfileVerificationOtp,
  updateProfile,
  verifyProfileOtp,
} from "@/api/auth.api";
import { getApiErrorMessage } from "@/api/client";
import { signUpload } from "@/api/media.api";
import { listTrips } from "@/api/trips.api";
import { getUserAvatarUrl } from "@/lib/avatar";
import { getGeminiSettings, isTemporaryGeminiFailure, maskGeminiKey, saveGeminiSettings, validateGeminiKey } from "@/lib/gemini";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/shared/toast-context";
import { Avatar } from "@/components/shared/Avatar";
import { Modal } from "@/components/ui/Modal";
import "@/styles/components/profile.css";
import "@/styles/components/ui.css";
import { AlertTriangle, Bot, Camera, CheckCircle2, Eye, EyeOff, KeyRound, Mail, Map, MessageCircle, Phone, Save, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

const styleOptions = ["heritage", "food", "nature", "adventure", "luxury", "budget", "workation", "pilgrimage"];

async function cropSquareImage(file) {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 512, 512);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Unable to crop image"))), "image/webp", 0.88);
  });
}

async function uploadProfilePhoto(file) {
  if (!file.type.startsWith("image/")) throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Profile photo must be below 8 MB.");
  const blob = await cropSquareImage(file);
  const signed = await signUpload({ folder: "traveloop/profiles", resourceType: "image" });
  const formData = new FormData();
  formData.append("file", blob, "profile.webp");
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", signed.timestamp);
  formData.append("signature", signed.signature);
  formData.append("folder", signed.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, { method: "POST", body: formData });
  if (!response.ok) throw new Error("Profile photo upload failed. Check Cloudinary configuration.");
  const payload = await response.json();
  return payload.secure_url;
}

export default function UserProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [showKey, setShowKey] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [verification, setVerification] = useState({
    emailOtp: "",
    phoneOtp: "",
    emailRequested: false,
    phoneRequested: false,
    phoneChannel: "sms",
  });
  const [gemini, setGemini] = useState(getGeminiSettings);
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
    bio: user?.bio || "",
    travelerProfile: user?.travelerProfile || "solo",
    preferredBudgetMin: user?.preferredBudgetMin ?? "",
    preferredBudgetMax: user?.preferredBudgetMax ?? "",
    travelStyles: user?.travelStyles || [],
  }));
  const avatarUrl = user ? getUserAvatarUrl({ ...user, avatarUrl: form.avatarUrl || user.avatarUrl }) : "";
  const { data } = useQuery({ queryKey: QUERY_KEYS.trips({ profile: true }), queryFn: () => listTrips({ limit: 6 }) });
  const trips = data?.trips ?? [];

  const saveMutation = useMutation({
    mutationFn: (body) => updateProfile(body),
    onMutate: async (body) => {
      const previous = user;
      setUser({ ...user, ...body });
      return { previous };
    },
    onSuccess: (nextUser) => {
      setUser(nextUser);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      showToast("Profile saved.", "success");
    },
    onError: (err, _body, context) => {
      if (context?.previous) setUser(context.previous);
      showToast(getApiErrorMessage(err), "error");
    },
  });

  const photoMutation = useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: (avatarUrl) => {
      setForm((value) => ({ ...value, avatarUrl }));
      saveMutation.mutate({ avatarUrl });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const keyMutation = useMutation({
    mutationFn: async () => {
      try {
        const ok = await validateGeminiKey(gemini.apiKey, gemini.model);
        if (!ok) throw new Error("Gemini did not validate this key.");
      } catch (err) {
        if (!isTemporaryGeminiFailure(err)) throw err;
        saveGeminiSettings(gemini);
        return { validated: false };
      }
      saveGeminiSettings(gemini);
      return { validated: true };
    },
    onSuccess: (result) => {
      if (result.validated) {
        showToast("Gemini key validated and saved locally.", "success");
        return;
      }
      showToast("Gemini is temporarily unavailable, so the key was saved locally without validation.", "info");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(deleteOtp),
    onSuccess: async () => {
      await logout().catch(() => {});
      useAuthStore.getState().logout();
      showToast("Your account has been deleted.", "success");
      navigate("/login", { replace: true });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const requestOtpMutation = useMutation({
    mutationFn: requestDeleteAccountOtp,
    onMutate: () => {
      setOtpRequested(true);
    },
    onSuccess: () => {
      setOtpRequested(true);
      showToast("OTP sent to your registered email. Phone channels are used when available.", "success");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const requestVerificationMutation = useMutation({
    mutationFn: requestProfileVerificationOtp,
    onMutate: ({ target }) => {
      setVerification((value) => ({
        ...value,
        emailRequested: target === "email" ? true : value.emailRequested,
        phoneRequested: target === "phone" ? true : value.phoneRequested,
      }));
    },
    onSuccess: (_data, variables) => {
      showToast(`${variables.target === "email" ? "Email" : "Phone"} OTP sent.`, "success");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyProfileOtp,
    onSuccess: async (_data, variables) => {
      const now = new Date().toISOString();
      setUser({
        ...useAuthStore.getState().user,
        ...(variables.target === "email" ? { emailVerifiedAt: now } : { phoneVerifiedAt: now }),
      });
      setVerification((value) => ({
        ...value,
        emailOtp: variables.target === "email" ? "" : value.emailOtp,
        phoneOtp: variables.target === "phone" ? "" : value.phoneOtp,
        emailRequested: variables.target === "email" ? false : value.emailRequested,
        phoneRequested: variables.target === "phone" ? false : value.phoneRequested,
      }));
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      showToast(`${variables.target === "email" ? "Email" : "Phone"} verified.`, "success");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const selectedStyles = useMemo(() => new Set(form.travelStyles), [form.travelStyles]);
  const toggleStyle = (style) => setForm((value) => ({
    ...value,
    travelStyles: selectedStyles.has(style) ? value.travelStyles.filter((item) => item !== style) : [...value.travelStyles, style],
  }));

  const save = (event) => {
    event.preventDefault();
    saveMutation.mutate({
      name: form.name,
      username: form.username || undefined,
      phoneNumber: form.phoneNumber || undefined,
      bio: form.bio || undefined,
      travelerProfile: form.travelerProfile,
      preferredBudgetMin: form.preferredBudgetMin === "" ? undefined : Number(form.preferredBudgetMin),
      preferredBudgetMax: form.preferredBudgetMax === "" ? undefined : Number(form.preferredBudgetMax),
      travelStyles: form.travelStyles,
      travelPreferences: { currency: "INR", locale: "en-IN" },
    });
  };

  return (
    <div className="profile-root" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "var(--sp-4xl)" }}>
      <div className="profile-header-card" style={{ background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", border: "1px solid var(--cl-border)", padding: "var(--sp-2xl)", marginBottom: "var(--sp-2xl)", display: "flex", flexDirection: "column", gap: "var(--sp-xl)", boxShadow: "var(--shadow-sm)" }}>
        {/* Top row: Avatar + Basic Info */}
        <div style={{ display: "flex", gap: "var(--sp-2xl)", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div className="profile-avatar-wrap" style={{ position: "relative", marginTop: "var(--sp-md)" }}>
            <Avatar name={user?.name || "Traveller"} url={avatarUrl} size="xl" />
            <label className="profile-avatar-edit" title="Upload profile photo" style={{ position: "absolute", bottom: "4px", right: "4px", background: "var(--cl-accent)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid var(--cl-surface)", boxShadow: "var(--shadow-sm)", transition: "transform var(--tr-fast)", zIndex: 10 }}>
              <Camera size={16} />
              <input hidden type="file" disabled={photoMutation.isPending} accept="image/png,image/jpeg,image/webp" onChange={(event) => event.target.files?.[0] && photoMutation.mutate(event.target.files[0])} />
            </label>
          </div>
          
          <div className="profile-header-info" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--sp-xs)" }}>
            <h1 className="profile-user-name" style={{ fontSize: "var(--fs-2xl)", margin: 0, fontWeight: "var(--fw-bold)" }}>{user?.name || "Traveller"}</h1>
            <div className="profile-user-email" style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-md)" }}>{user?.email || "No email"} · Gemini: {maskGeminiKey(gemini.apiKey)} {photoMutation.isPending ? "· Uploading photo..." : ""}</div>
          </div>
        </div>

        {/* Bottom row: Stats */}
        <div className="profile-stats-row" style={{ display: "flex", gap: "var(--sp-3xl)", marginTop: "var(--sp-md)", paddingTop: "var(--sp-lg)", borderTop: "1px solid var(--cl-bg-subtle)" }}>
          <div className="profile-stat"><div className="profile-stat-value" style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--cl-accent)" }}>{data?.meta?.total ?? trips.length}</div><div className="profile-stat-label" style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-on-surface)", fontWeight: "var(--fw-bold)", textTransform: "uppercase", opacity: 0.8 }}>Trips</div></div>
          <div className="profile-stat"><div className="profile-stat-value" style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--cl-accent)", textTransform: "capitalize" }}>{user?.travelerProfile || "solo"}</div><div className="profile-stat-label" style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-on-surface)", fontWeight: "var(--fw-bold)", textTransform: "uppercase", opacity: 0.8 }}>Profile</div></div>
          <div className="profile-stat"><div className="profile-stat-value" style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--cl-accent)" }}>INR</div><div className="profile-stat-label" style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-on-surface)", fontWeight: "var(--fw-bold)", textTransform: "uppercase", opacity: 0.8 }}>Currency</div></div>
        </div>
      </div>

      <div className="profile-grid">
        <form className="profile-form-card" onSubmit={save}>
          <h2 className="profile-form-section-title">Profile Settings</h2>
          <label className="input-wrap">
            <span className="input-label">Email</span>
            <div className="profile-readonly-contact">
              <Mail size={16} />
              <span>{user?.email || "No email"}</span>
              <span className={`profile-verify-pill ${user?.emailVerifiedAt ? "verified" : ""}`}>
                {user?.emailVerifiedAt ? <CheckCircle2 size={14} /> : <ShieldCheck size={14} />}
                {user?.emailVerifiedAt ? "Verified" : "Not verified"}
              </span>
            </div>
          </label>
          <div className="profile-form-row">
            <label className="input-wrap"><span className="input-label">Name</span><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
            <label className="input-wrap"><span className="input-label">Username</span><input className="input" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} placeholder="traveller_01" /></label>
          </div>
          <label className="input-wrap"><span className="input-label">Bio</span><textarea className="input" rows={4} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell Traveloop what kind of journeys you love." /></label>
          <div className="profile-form-row">
            <label className="input-wrap">
              <span className="input-label">Phone</span>
              <input className="input" value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
              <span className={`profile-verify-pill profile-inline-pill ${user?.phoneVerifiedAt ? "verified" : ""}`}>
                {user?.phoneVerifiedAt ? <CheckCircle2 size={14} /> : <ShieldCheck size={14} />}
                {user?.phoneVerifiedAt ? "Verified" : "Not verified"}
              </span>
            </label>
            <label className="input-wrap"><span className="input-label">Traveller Type</span><select className="input" value={form.travelerProfile} onChange={(e) => setForm((f) => ({ ...f, travelerProfile: e.target.value }))}><option value="solo">Solo</option><option value="couple">Couple</option><option value="family">Family</option><option value="group">Group</option><option value="senior">Senior</option></select></label>
          </div>
          <div className="profile-form-row">
            <label className="input-wrap"><span className="input-label">Budget Min INR</span><input className="input" type="number" min="0" value={form.preferredBudgetMin} onChange={(e) => setForm((f) => ({ ...f, preferredBudgetMin: e.target.value }))} /></label>
            <label className="input-wrap"><span className="input-label">Budget Max INR</span><input className="input" type="number" min="0" value={form.preferredBudgetMax} onChange={(e) => setForm((f) => ({ ...f, preferredBudgetMax: e.target.value }))} /></label>
          </div>
          <div className="style-chip-grid">{styleOptions.map((style) => <button key={style} type="button" className={`style-chip${selectedStyles.has(style) ? " active" : ""}`} onClick={() => toggleStyle(style)}>{style}</button>)}</div>
          <button className="btn btn-primary" disabled={saveMutation.isPending}><Save size={16} /> Save Profile</button>

          <div className="profile-form-divider" />
          <h2 className="profile-form-section-title">Verify Email & Phone</h2>
          <div className="profile-verify-grid">
            <div className="profile-verify-box">
              <div className="profile-verify-heading"><Mail size={16} /> Email OTP</div>
              <p className="profile-help">Your login email is fixed for this account and can be verified here.</p>
              {verification.emailRequested && (
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verification.emailOtp}
                  onChange={(e) => setVerification((value) => ({ ...value, emailOtp: e.target.value.replace(/\D/g, "") }))}
                  placeholder="Enter email OTP"
                />
              )}
              <div className="profile-action-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={requestVerificationMutation.isPending}
                  onClick={() => requestVerificationMutation.mutate({ target: "email" })}
                >
                  <Mail size={14} /> {verification.emailRequested ? "Resend" : "Send"} OTP
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={verifyMutation.isPending || verification.emailOtp.length !== 6}
                  onClick={() => verifyMutation.mutate({ target: "email", otp: verification.emailOtp })}
                >
                  Verify
                </button>
              </div>
            </div>
            <div className="profile-verify-box">
              <div className="profile-verify-heading"><Phone size={16} /> Phone OTP</div>
              <p className="profile-help">Save your phone number first, then choose SMS or WhatsApp for the OTP.</p>
              <select
                className="input"
                value={verification.phoneChannel}
                onChange={(e) => setVerification((value) => ({ ...value, phoneChannel: e.target.value }))}
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              {verification.phoneRequested && (
                <input
                  className="input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verification.phoneOtp}
                  onChange={(e) => setVerification((value) => ({ ...value, phoneOtp: e.target.value.replace(/\D/g, "") }))}
                  placeholder="Enter phone OTP"
                />
              )}
              <div className="profile-action-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={requestVerificationMutation.isPending || !form.phoneNumber}
                  onClick={() => requestVerificationMutation.mutate({ target: "phone", channel: verification.phoneChannel })}
                >
                  <MessageCircle size={14} /> {verification.phoneRequested ? "Resend" : "Send"} OTP
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={verifyMutation.isPending || verification.phoneOtp.length !== 6}
                  onClick={() => verifyMutation.mutate({ target: "phone", otp: verification.phoneOtp })}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          <div className="profile-form-divider" />
          <h2 className="profile-form-section-title">Gemini API Key</h2>
          <p className="profile-help">Your key stays in this browser only. Traveloop never stores it in the backend database.</p>
          <div className="profile-key-row">
            <KeyRound size={18} />
            <input className="input" type={showKey ? "text" : "password"} value={gemini.apiKey} onChange={(e) => setGemini((value) => ({ ...value, apiKey: e.target.value }))} placeholder="AIza..." />
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => setShowKey((value) => !value)}>{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <label className="input-wrap"><span className="input-label">Model</span><input className="input" value={gemini.model} onChange={(e) => setGemini((value) => ({ ...value, model: e.target.value }))} /></label>
          <button type="button" className="btn btn-secondary" disabled={keyMutation.isPending || !gemini.apiKey} onClick={() => keyMutation.mutate()}><Sparkles size={16} /> Validate & Save Key</button>
        </form>

        <div className="profile-trips-panel">
          <div className="profile-trips-panel-title"><Map size={18} /> Recent Trips</div>
          {trips.map((trip) => <Link key={trip.id} to={ROUTES.tripDetail(trip.id)} className="profile-trip-item"><div className="profile-trip-thumb"><Map size={24} /></div><div className="profile-trip-name">{trip.title}</div></Link>)}
          {trips.length === 0 && <div className="profile-help">No trips yet.</div>}

          <div className="profile-form-divider" style={{ marginTop: "var(--sp-lg)" }} />
          <div className="profile-ai-help-card">
            <div className="profile-trips-panel-title"><Bot size={18} /> How AI Works</div>
            <ol>
              <li><strong>Profile:</strong> add and validate your Gemini key here to unlock backend AI endpoints.</li>
              <li><strong>Itinerary:</strong> open a trip itinerary and click AI Ideas for context-aware stop and activity suggestions.</li>
              <li><strong>Budget:</strong> click AI Estimate for realistic INR daily splits by stay, food, and activities.</li>
              <li><strong>Packing:</strong> click Auto-generate List to inject categorized trip items into the checklist.</li>
              <li><strong>Dashboard:</strong> use it as the entry hub for quick actions and AI planning links.</li>
            </ol>
          </div>

          <div className="profile-form-divider" style={{ marginTop: "var(--sp-lg)" }} />
          <div style={{ border: "1px solid rgba(231, 111, 81, 0.35)", borderRadius: "var(--br-xl)", padding: "var(--sp-md)", background: "rgba(231, 111, 81, 0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontWeight: 700, marginBottom: "6px", color: "var(--cl-error)" }}>
              <AlertTriangle size={16} /> Danger Zone
            </div>
            <p className="profile-help" style={{ marginBottom: "var(--sp-sm)" }}>
              Delete your account permanently. This action cannot be undone.
            </p>
            <button
              type="button"
              className="btn"
              style={{ background: "var(--cl-error)", color: "#fff" }}
              onClick={() => {
                setDeleteOtp("");
                setOtpRequested(false);
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={isDeleteOpen}
        title="Delete account"
        onClose={() => {
          if (deleteMutation.isPending) return;
          setDeleteOtp("");
          setOtpRequested(false);
          setIsDeleteOpen(false);
        }}
        closeDisabled={deleteMutation.isPending}
      >
        <p style={{ marginTop: 0, color: "var(--cl-text-muted)" }}>
          We will send a one-time OTP to your registered email. If a phone number is saved, Traveloop also tries SMS and WhatsApp.
        </p>
        {otpRequested && (
          <label className="input-wrap">
            <span className="input-label">OTP</span>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={deleteOtp}
              onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
            />
          </label>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--sp-sm)", marginTop: "var(--sp-md)" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setDeleteOtp("");
              setOtpRequested(false);
              setIsDeleteOpen(false);
            }}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={requestOtpMutation.isPending}
            onClick={() => requestOtpMutation.mutate()}
          >
            {requestOtpMutation.isPending ? "Sending OTP..." : otpRequested ? "Resend OTP" : "Send OTP"}
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: "var(--cl-error)", color: "#fff" }}
            disabled={deleteMutation.isPending || deleteOtp.length !== 6}
            onClick={() => deleteMutation.mutate()}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
