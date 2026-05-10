import { Link, useParams } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useLocalState } from "@/lib/localStore";
import { SearchX, Calendar, Banknote, Luggage, StickyNote, MapPin, Pencil, FileText, Image as ImageIcon } from "lucide-react";
import "@/styles/components/trips.css";
import "@/styles/components/ui.css";

export default function TripDetailPage() {
  const { id } = useParams();
  const [localState] = useLocalState();

  const trip = localState.trips.find((t) => t.id === id);

  if (!trip) {
    return (
      <div className="trips-root" style={{ textAlign: "center", padding: "var(--sp-3xl) var(--sp-xl)" }}>
        <div style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-md)" }}><SearchX size={64} /></div>
        <h1 className="trips-title">Trip Not Found</h1>
        <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-xl)" }}>
          We couldn't find the trip you're looking for. It might have been deleted.
        </p>
        <Link to={ROUTES.trips} className="btn btn-primary">Back to My Trips</Link>
      </div>
    );
  }

  const managementLinks = [
    { label: "Itinerary Builder", icon: Calendar, to: ROUTES.tripItinerary(trip.id), desc: "Plan your day-by-day activities" },
    { label: "Budget Breakdown",  icon: Banknote, to: ROUTES.tripBudget(trip.id),    desc: "Track expenses and estimates" },
    { label: "Packing Checklist", icon: Luggage, to: ROUTES.tripPacking(trip.id),   desc: "Manage your travel essentials" },
    { label: "Trip Notes",       icon: StickyNote, to: ROUTES.tripNotes(trip.id),     desc: "Capture thoughts and bookings" },
    { label: "Trip Documents",    icon: FileText,   to: ROUTES.tripDocs(trip.id),      desc: "Store important travel files" },
    { label: "Trip Gallery",      icon: ImageIcon,  to: ROUTES.tripMedia(trip.id),     desc: "View and manage trip photos" },
  ];

  return (
    <div className="trips-root">
      {/* Hero / Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--cl-surface) 0%, var(--cl-surface-2) 100%)",
        borderRadius: "var(--br-2xl)",
        padding: "var(--sp-2xl)",
        border: "1px solid var(--cl-border-surface)",
        marginBottom: "var(--sp-xl)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--sp-md)" }}>
            <div>
              <div style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semibold)", color: "var(--cl-warm)", textTransform: "uppercase", letterSpacing: "var(--ls-wide)", marginBottom: "var(--sp-sm)" }}>
                Trip Overview
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-extrabold)", color: "var(--cl-text-on-surface)", letterSpacing: "var(--ls-tight)" }}>
                {trip.title}
              </h1>
              <div style={{ display: "flex", gap: "var(--sp-md)", marginTop: "var(--sp-md)", color: "rgba(244,241,222,0.6)", fontSize: "var(--fs-sm)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={16} /> {trip.place || "No destination set"}</span>
                {trip.startDate && <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={16} /> {trip.startDate} → {trip.endDate}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
              <span className="badge badge-warm">{trip.status?.toUpperCase() || "UPCOMING"}</span>
              <button className="btn btn-surface btn-icon" title="Edit trip details"><Pencil size={16} /></button>
            </div>
          </div>
        </div>

        {/* Deco */}
        <div style={{
          position: "absolute",
          top: "-20%",
          right: "-5%",
          width: "15rem",
          height: "15rem",
          background: "radial-gradient(circle, rgba(224,122,95,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* Management Grid */}
      <div className="dashboard-section-title">
        <span>Trip Management Hub</span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
        gap: "var(--sp-lg)",
        marginBottom: "var(--sp-2xl)",
      }}>
        {managementLinks.map((link) => (
          <Link key={link.to} to={link.to} className="card card-hover" style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "var(--sp-sm)" }}>
            <div className="city-card-icon" style={{ color: "var(--cl-accent)" }}><link.icon size={32} /></div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)", color: "var(--cl-text)" }}>
              {link.label}
            </div>
            <p style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", lineHeight: "var(--lh-body)" }}>
              {link.desc}
            </p>
            <div style={{ marginTop: "auto", fontSize: "var(--fs-xs)", color: "var(--cl-accent)", fontWeight: "var(--fw-semibold)" }}>
              Open Section →
            </div>
          </Link>
        ))}
      </div>

      {/* Quick stats / summary cards */}
      <div style={{ display: "flex", gap: "var(--sp-lg)", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: "15rem", background: "var(--cl-bg-alt)" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", marginBottom: "var(--sp-xs)" }}>Total Budget</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-teal)" }}>
            ₹{trip.budget?.toLocaleString() || "0"}
          </div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: "15rem", background: "var(--cl-bg-alt)" }}>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", marginBottom: "var(--sp-xs)" }}>Duration</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-accent)" }}>
            {trip.startDate ? "Multi-day" : "TBD"}
          </div>
        </div>
      </div>
    </div>
  );
}
