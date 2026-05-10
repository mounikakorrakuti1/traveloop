import { useState } from "react";
import { useLocalState } from "@/lib/localStore";
import "@/styles/components/admin.css";
import "@/styles/components/ui.css";
import { Map, StickyNote, Globe, Search, Settings, HardHat } from "lucide-react";

const TABS = ["Manage Users", "Popular Cities", "Popular Activities", "User Trends & Analytics"];

export default function AdminPanelPage() {
  const [localState] = useLocalState();
  const [tab, setTab] = useState(0);

  const stats = [
    { icon: <Map size={24} />, value: localState.trips.length,          label: "Total Trips",       variant: "stat-card-peach"  },
    { icon: <StickyNote size={24} />, value: localState.notes.length,           label: "Total Notes",        variant: "stat-card-warm"   },
    { icon: <Globe size={24} />, value: localState.communityPosts.length,  label: "Community Posts",    variant: "stat-card-teal"   },
    { icon: <Search size={24} />, value: localState.searchOptions.length,   label: "Saved Searches",     variant: "stat-card-indigo" },
  ];

  /* Bar chart data */
  const bars = [28, 48, 32, 70, 58, 82, 45].map((h, i) => ({
    h,
    label: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  }));

  return (
    <div className="admin-root">
      {/* Header */}
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <span className="badge badge-teal" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Settings size={14} /> Admin Access</span>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`admin-tab${tab === i ? " active" : ""}`}
            onClick={() => setTab(i)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 0 && (
        <div className="card">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-lg)", fontSize: "var(--fs-md)" }}>
            User Management
          </h2>
          <table className="budget-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                {["User", "Email", "Trips", "Status", "Actions"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Admin User", email: "admin@travelloop.com", trips: localState.trips.length, status: "Active" },
                { name: "Demo User",  email: "demo@travelloop.com",  trips: 0,                       status: "Active" },
              ].map((u) => (
                <tr key={u.email}>
                  <td style={{ fontWeight: "var(--fw-medium)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)" }}>
                      <div className="avatar avatar-sm">{u.name[0]}</div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-xs)" }}>{u.email}</td>
                  <td>{u.trips}</td>
                  <td><span className="badge badge-teal">{u.status}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-xs">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 3 && (
        <div className="card">
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-xl)", fontSize: "var(--fs-md)" }}>
            Trip Activity (This Week)
          </h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--sp-sm)", height: "10rem", padding: "0 var(--sp-md)" }}>
            {bars.map((b) => (
              <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-xs)" }}>
                <div
                  style={{
                    width: "100%",
                    height: `${b.h}%`,
                    background: "linear-gradient(to top, var(--cl-accent), var(--cl-warm))",
                    borderRadius: "var(--br-sm) var(--br-sm) 0 0",
                    transition: "height 0.4s var(--tr-slow)",
                  }}
                />
                <span style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)" }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(tab === 1 || tab === 2) && (
        <div className="empty-state">
          <div className="empty-state-icon"><HardHat size={48} /></div>
          <div className="empty-state-title">Coming Soon</div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
            This section is under development.
          </p>
        </div>
      )}
    </div>
  );
}
