import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useLocalState } from "@/lib/localStore";
import "@/styles/components/trips.css";
import "@/styles/components/ui.css";
import { CheckCircle, Clock, Search, Map, MapPin, Calendar, Banknote, Umbrella, Mountain, Castle, Trees, Building2, ChevronRight, MapPinned } from "lucide-react";

const STATUS_META = {
  ongoing:   { label: "Ongoing",   icon: Clock,       dot: "dot-ongoing"   },
  upcoming:  { label: "Upcoming",  icon: MapPinned,   dot: "dot-upcoming"  },
  completed: { label: "Completed", icon: CheckCircle, dot: "dot-completed" },
};

const DESTINATION_ICONS = {
  Goa: Umbrella, Jaipur: Castle, Udaipur: Building2, Manali: Mountain,
  Mysuru: Castle, Shillong: Trees, Kerala: Trees, Ladakh: Mountain,
};

export default function TripListPage() {
  const [localState] = useLocalState();
  const [filter, setFilter] = useState("all");
  const [query, setQuery]   = useState("");

  const allTrips = localState.trips;
  const filtered = allTrips.filter((t) => {
    const matchStatus = filter === "all" || t.status === filter;
    const matchQuery  = !query || t.title.toLowerCase().includes(query.toLowerCase()) || (t.place || "").toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchQuery;
  });

  const grouped = ["ongoing", "upcoming", "completed"].reduce((acc, status) => {
    acc[status] = filtered.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <div className="trips-root">
      {/* Header */}
      <div className="trips-header">
        <h1 className="trips-title">My Trips</h1>
        <Link to={ROUTES.tripNew} className="btn btn-primary">
          + Plan New Trip
        </Link>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: "var(--sp-sm)", alignItems: "center", marginBottom: "var(--sp-lg)" }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: "var(--sp-sm)",
          background: "var(--cl-bg-alt)", border: "1.5px solid var(--cl-border)",
          borderRadius: "var(--br-xl)", padding: "var(--sp-xs) var(--sp-md)",
          transition: "border-color var(--tr-fast)",
        }}>
          <Search size={18} color="var(--cl-text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trips…"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "var(--fs-sm)", color: "var(--cl-text)", fontFamily: "var(--font-body)" }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="trips-filters">
        {["all", "ongoing", "upcoming", "completed"].map((s) => (
          <button
            key={s}
            className={`filter-tab${filter === s ? " active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span style={{ marginLeft: "4px", opacity: 0.6 }}>
              ({s === "all" ? allTrips.length : allTrips.filter((t) => t.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Trip sections */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Map size={48} /></div>
          <div className="empty-state-title">No trips found</div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
            {query ? `No results for "${query}"` : "Start planning your first adventure!"}
          </p>
          <Link to={ROUTES.tripNew} className="btn btn-primary">Plan a Trip →</Link>
        </div>
      ) : (
        ["ongoing", "upcoming", "completed"].map((status) => {
          const trips = grouped[status];
          if (!trips.length) return null;
          const meta = STATUS_META[status];
          return (
            <div key={status}>
              <h2 className="trip-section-heading">
                <span className={`trip-section-dot ${meta.dot}`} />
                {meta.label} ({trips.length})
              </h2>
              {trips.map((trip) => {
                const IconComponent = DESTINATION_ICONS[trip.place] || Map;
                return (
                  <Link key={trip.id} to={ROUTES.tripItinerary(trip.id)} className="trip-list-card">
                    <div className="trip-list-thumb"><IconComponent size={24} /></div>
                    <div>
                      <div className="trip-list-name">{trip.title}</div>
                      <div className="trip-list-meta">
                        {trip.place && <span className="trip-list-meta-item"><MapPin size={14} /> {trip.place}</span>}
                        {trip.startDate && <span className="trip-list-meta-item"><Calendar size={14} /> {trip.startDate}</span>}
                        {trip.budget  && <span className="trip-list-meta-item"><Banknote size={14} /> ₹{trip.budget.toLocaleString()}</span>}
                      </div>
                    </div>
                    <span style={{ color: "var(--cl-text-muted)" }}><ChevronRight size={20} /></span>
                  </Link>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}
