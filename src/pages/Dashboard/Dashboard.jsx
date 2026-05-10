import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { useLocalState } from "@/lib/localStore";
import "@/styles/components/dashboard.css";
import "@/styles/components/ui.css";
import { Hand, Map, StickyNote, Luggage, Globe, Search, Sparkles, MapPin, Calendar, Plus, User, Umbrella, Castle, Building2, Mountain, Trees } from "lucide-react";

const destinations = [
  { name: "Goa",      icon: Umbrella },
  { name: "Jaipur",   icon: Castle },
  { name: "Udaipur",  icon: Building2 },
  { name: "Manali",   icon: Mountain },
  { name: "Mysuru",   icon: Castle },
  { name: "Shillong", icon: Trees },
  { name: "Kerala",   icon: Trees },
  { name: "Ladakh",   icon: Mountain },
];

const statusColors = {
  ongoing:   { bg: "var(--cl-teal-light)",  text: "#2D7A5A", label: "Ongoing" },
  upcoming:  { bg: "var(--cl-warm-light)",  text: "#8B5E00", label: "Upcoming" },
  completed: { bg: "var(--cl-bg-alt)",      text: "var(--cl-text-muted)", label: "Done" },
};

export default function DashboardPage() {
  const user         = useAuthStore((s) => s.user);
  const [localState] = useLocalState();
  const recentTrips  = localState.trips.slice(0, 3);

  const stats = [
    { icon: Map, value: localState.trips.length,         label: "Trips Planned",   variant: "stat-card-peach"  },
    { icon: StickyNote, value: localState.notes.length,          label: "Notes Saved",      variant: "stat-card-warm"   },
    { icon: Luggage, value: localState.packingGroups.reduce((a, g) => a + g.items.length, 0), label: "Items Packed", variant: "stat-card-teal" },
    { icon: Globe, value: localState.communityPosts.length, label: "Community Posts",  variant: "stat-card-indigo" },
  ];

  const firstName = user?.name?.split(" ")[0] || "Traveller";

  return (
    <div className="dashboard-root">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <span className="dashboard-greeting-label">Welcome back</span>
          <h1 className="dashboard-greeting-name" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>Hey, {firstName} <Hand size={28} color="var(--cl-warm)" /></h1>
          <p className="dashboard-greeting-sub">
            Where are you headed next?
          </p>
        </div>
        <Link to={ROUTES.tripNew} className="btn btn-primary btn-lg">
          + Plan New Trip
        </Link>
      </div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="dashboard-stats">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card ${s.variant}`}>
            <div className="stat-icon"><s.icon size={24} /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search Bar ──────────────────────────────────── */}
      <div className="dashboard-search">
        <span className="dashboard-search-icon" style={{ display: "flex" }}><Search size={18} /></span>
        <input placeholder="Search destinations, trips, or activities…" />
        <Link to={ROUTES.search} className="btn btn-accent btn-sm" style={{ color: "var(--cl-accent)", fontSize: "var(--fs-xs)" }}>
          Search
        </Link>
      </div>

      <div className="dashboard-grid">
        <div>
          {/* ── Hero Banner ─────────────────────────────── */}
          <div className="dashboard-hero-banner">
            <div className="dashboard-banner-content">
              <div className="dashboard-banner-label" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Sparkles size={16} /> Pro tip</div>
              <h2 className="dashboard-banner-title">
                Use AI to generate your itinerary
              </h2>
              <p className="dashboard-banner-sub">
                Tell us your destination and dates — our AI will plan the perfect trip in seconds.
              </p>
              <Link to={ROUTES.tripNew} className="btn btn-primary">
                Try AI Planner →
              </Link>
            </div>
          </div>

          {/* ── Recent Trips ────────────────────────────── */}
          <div className="dashboard-section-title">
            <span>Recent Trips</span>
            <Link to={ROUTES.trips} style={{ fontSize: "var(--fs-sm)", color: "var(--cl-accent)", fontWeight: "var(--fw-medium)" }}>
              View all →
            </Link>
          </div>

          {recentTrips.length > 0 ? (
            <div className="trip-cards-row">
              {recentTrips.map((trip) => {
                const st = statusColors[trip.status] || statusColors.upcoming;
                return (
                  <Link key={trip.id} to={ROUTES.tripItinerary(trip.id)} className="trip-mini-card">
                    <div className="trip-mini-thumb">
                      <Map size={24} />
                      <div className="trip-mini-status">
                        <span style={{
                          fontSize: "var(--fs-xs)",
                          padding: "2px var(--sp-xs)",
                          borderRadius: "var(--br-full)",
                          background: st.bg,
                          color: st.text,
                          fontWeight: "var(--fw-semibold)",
                        }}>
                          {st.label}
                        </span>
                      </div>
                    </div>
                    <div className="trip-mini-body">
                      <div className="trip-mini-name">{trip.title}</div>
                      <div className="trip-mini-place" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={12} /> {trip.place || "No place set"}</div>
                      {trip.startDate && (
                        <div className="trip-mini-dates" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={12} /> {trip.startDate} → {trip.endDate}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Map size={48} /></div>
              <div className="empty-state-title">No trips yet</div>
              <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
                Start planning your first adventure!
              </p>
              <Link to={ROUTES.tripNew} className="btn btn-primary">Plan a Trip →</Link>
            </div>
          )}

          {/* ── Destinations ────────────────────────────── */}
          <div className="dashboard-section-title" style={{ marginTop: "var(--sp-xl)" }}>
            <span>Explore Destinations</span>
          </div>
          <div className="dest-row">
            {destinations.map((d) => (
              <Link key={d.name} to={ROUTES.tripNew} className="dest-pill">
                <span className="dest-pill-emoji" style={{ display: "flex" }}><d.icon size={20} /></span>
                <span className="dest-pill-name">{d.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Quick Actions Sidebar ────────────────────── */}
        <div className="quick-actions-panel">
          <div className="quick-action-card">
            <div className="dashboard-section-title" style={{ marginBottom: "var(--sp-md)" }}>
              Quick Actions
            </div>
            {[
              { icon: Plus,   label: "New Trip",        to: ROUTES.tripNew },
              { icon: Search, label: "Explore",         to: ROUTES.search },
              { icon: User,   label: "My Profile",      to: ROUTES.profile },
              { icon: Globe,  label: "Community",       to: ROUTES.community },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--sp-md)",
                  padding: "var(--sp-sm) var(--sp-md)",
                  borderRadius: "var(--br-lg)",
                  marginBottom: "var(--sp-xs)",
                  fontSize: "var(--fs-sm)",
                  fontWeight: "var(--fw-medium)",
                  color: "var(--cl-text)",
                  textDecoration: "none",
                  transition: "background var(--tr-fast)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--cl-bg-alt)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ display: "flex", color: "var(--cl-accent)" }}><a.icon size={18} /></span>
                {a.label}
                <span style={{ marginLeft: "auto", color: "var(--cl-text-muted)" }}>→</span>
              </Link>
            ))}
          </div>

          <div className="quick-action-card" style={{ background: "var(--cl-surface)", border: "1px solid var(--cl-border-surface)" }}>
            <div style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-wider)", textTransform: "uppercase", color: "var(--cl-warm)", marginBottom: "var(--sp-sm)", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
              <Sparkles size={14} /> AI Feature
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: "var(--cl-text-on-surface)", marginBottom: "var(--sp-xs)" }}>
              Generate Itinerary
            </div>
            <p style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)", lineHeight: "var(--lh-body)", marginBottom: "var(--sp-md)" }}>
              Let AI plan your perfect trip based on your preferences and budget.
            </p>
            <Link to={ROUTES.tripNew} className="btn btn-accent btn-sm" style={{ background: "var(--cl-accent)", color: "#fff", width: "100%", justifyContent: "center" }}>
              Try Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
