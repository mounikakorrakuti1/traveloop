import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLocalState } from "@/lib/localStore";
import "@/styles/components/profile.css";
import "@/styles/components/ui.css";
import { Pencil, CheckCircle, Map } from "lucide-react";

export default function UserProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [localState] = useLocalState();
  const [formSaved, setFormSaved] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const stats = [
    { value: localState.trips.length, label: "Trips" },
    { value: localState.notes.length, label: "Notes" },
    { value: localState.communityPosts.length, label: "Posts" },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setFormSaved(true);
    setTimeout(() => setFormSaved(false), 2000);
  };

  return (
    <div className="profile-root">
      {/* Profile header card */}
      <div className="profile-header-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
              />
            ) : (
              initials
            )}
          </div>
          <div className="profile-avatar-edit" title="Change photo" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><Pencil size={14} /></div>
        </div>

        <div className="profile-header-info">
          <h1 className="profile-user-name">{user?.name || "Traveller"}</h1>
          <div className="profile-user-email">{user?.email || "No email"}</div>
          <div className="profile-stats-row">
            {stats.map((s) => (
              <div key={s.label} className="profile-stat">
                <div className="profile-stat-value">{s.value}</div>
                <div className="profile-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="profile-grid">
        {/* Form */}
        <div className="profile-form-card">
          <form onSubmit={handleSave}>
            <h2 className="profile-form-section-title">Personal Information</h2>

            <div className="profile-form-row" style={{ gap: "var(--sp-md)", marginBottom: "var(--sp-md)" }}>
              <div className="input-wrap">
                <label className="input-label" htmlFor="pf-fname">First Name</label>
                <input
                  id="pf-fname"
                  className="input"
                  defaultValue={user?.name?.split(" ")[0] || ""}
                  placeholder="First name"
                />
              </div>
              <div className="input-wrap">
                <label className="input-label" htmlFor="pf-lname">Last Name</label>
                <input
                  id="pf-lname"
                  className="input"
                  defaultValue={user?.name?.split(" ")[1] || ""}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}>
              <label className="input-label" htmlFor="pf-email">Email</label>
              <input
                id="pf-email"
                type="email"
                className="input"
                defaultValue={user?.email || ""}
                placeholder="you@example.com"
              />
            </div>

            <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}>
              <label className="input-label" htmlFor="pf-bio">Bio</label>
              <textarea
                id="pf-bio"
                className="input"
                rows={3}
                placeholder="Tell us about yourself as a traveller…"
              />
            </div>

            <div className="profile-form-divider" />
            <h2 className="profile-form-section-title">Travel Preferences</h2>

            <div className="profile-form-row" style={{ gap: "var(--sp-md)", marginBottom: "var(--sp-md)" }}>
              <div className="input-wrap">
                <label className="input-label">Travel Style</label>
                <select className="input">
                  <option>Solo Explorer</option>
                  <option>Budget Traveller</option>
                  <option>Luxury</option>
                  <option>Adventure</option>
                  <option>Family</option>
                </select>
              </div>
              <div className="input-wrap">
                <label className="input-label">Home City</label>
                <input className="input" placeholder="e.g., Mumbai" />
              </div>
            </div>

            <div className="profile-form-divider" />
            <h2 className="profile-form-section-title">Security</h2>

            <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}>
              <label className="input-label">New Password</label>
              <input type="password" className="input" placeholder="Leave blank to keep current" />
            </div>
            <div className="input-wrap" style={{ marginBottom: "var(--sp-lg)" }}>
              <label className="input-label">Confirm Password</label>
              <input type="password" className="input" placeholder="Repeat new password" />
            </div>

            <button type="submit" className="btn btn-primary">
              {formSaved ? <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", justifyContent: "center" }}><CheckCircle size={16} /> Saved!</span> : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Trips sidebar */}
        <div className="profile-trips-panel">
          <div className="profile-trips-panel-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Map size={18} /> Recent Trips</div>
          {localState.trips.slice(0, 6).map((trip) => (
            <div key={trip.id} className="profile-trip-item">
              <div className="profile-trip-thumb"><Map size={24} /></div>
              <div className="profile-trip-name">{trip.title}</div>
            </div>
          ))}
          {localState.trips.length === 0 && (
            <div style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-xs)" }}>
              No trips yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
