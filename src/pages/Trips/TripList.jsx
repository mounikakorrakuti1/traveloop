import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listTrips } from "@/api/trips.api";
import { ROUTES, QUERY_KEYS } from "@/lib/constants";
import { formatDate, getTripBudget, usd } from "@/lib/format";
import { getTripCardCoverUrl } from "@/lib/tripCover";
import { SmartImage } from "@/components/shared/SmartImage";
import { SkeletonRow } from "@/components/shared/Skeleton";
import "@/styles/components/trips.css";
import "@/styles/components/ui.css";
import { CheckCircle, Clock, Search, Map, Calendar, Banknote, ChevronRight, MapPinned, Plane } from "lucide-react";

const STATUS_META = {
  planning: { label: "Planning", icon: MapPinned, dot: "dot-upcoming" },
  confirmed: { label: "Confirmed", icon: MapPinned, dot: "dot-upcoming" },
  ongoing: { label: "Ongoing", icon: Clock, dot: "dot-ongoing" },
  completed: { label: "Completed", icon: CheckCircle, dot: "dot-completed" },
};

export default function TripListPage() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const filters = {
    page: 1,
    limit: 50,
    sort: "startDate",
    ...(status !== "all" ? { status } : {}),
    ...(query.trim() ? { search: query.trim() } : {}),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.trips(filters),
    queryFn: () => listTrips(filters),
    keepPreviousData: true,
  });

  const trips = data?.trips ?? [];

  return (
    <div className="trips-root" style={{ maxWidth: "var(--max-w-xl)", margin: "0 auto", paddingBottom: "var(--sp-4xl)" }}>
      <div className="trips-header" style={{ marginBottom: "var(--sp-2xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--sp-lg)" }}>
        <div>
          <h1 className="trips-title" style={{ fontSize: "var(--fs-3xl)", display: "flex", alignItems: "center", gap: "var(--sp-sm)", marginBottom: "var(--sp-xs)" }}>
            My Trips <Plane size={28} color="var(--cl-accent)" />
          </h1>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", margin: 0 }}>Manage your itineraries, budgets, and travel plans.</p>
        </div>
        <Link to={ROUTES.tripNew} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", padding: "var(--sp-sm) var(--sp-lg)" }}>
          <Map size={18} /> Plan New Trip
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--sp-xl)" }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-lg)" }}>
          <div style={{ display: "flex", gap: "var(--sp-sm)", alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "var(--sp-sm)", background: "var(--cl-surface)", border: "1px solid var(--cl-border)", borderRadius: "var(--br-full)", padding: "var(--sp-sm) var(--sp-lg)", boxShadow: "var(--shadow-sm)" }}>
              <Search size={20} color="var(--cl-text-muted)" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trips by destination or title..." style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: "var(--fs-md)", color: "var(--cl-text)" }} />
              {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", color: "var(--cl-text-muted)", cursor: "pointer" }}>Clear</button>}
            </div>
          </div>

          <div className="trips-filters" style={{ borderBottom: "1px solid var(--cl-border)", paddingBottom: "var(--sp-md)", marginBottom: "var(--sp-md)" }}>
            {["all", "planning", "confirmed", "ongoing", "completed"].map((s) => (
              <button key={s} className={`filter-tab${status === s ? " active" : ""}`} onClick={() => setStatus(s)} style={{ fontSize: "var(--fs-md)", padding: "var(--sp-sm) var(--sp-lg)" }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)" }}>
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : isError ? (
          <div className="empty-state" style={{ background: "rgba(192,57,43,0.05)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "var(--br-xl)" }}>
            <div className="empty-state-title" style={{ color: "var(--cl-error)" }}>Unable to load trips</div>
            <p style={{ color: "var(--cl-text-muted)" }}>Check that the backend is running and you are signed in.</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-state" style={{ padding: "var(--sp-2xl) var(--sp-xl)", background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-md)" }}>
            <div className="empty-state-icon" style={{ background: "var(--cl-bg-subtle)", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: 0 }}>
              <Map size={32} color="var(--cl-text-muted)" />
            </div>
            <div className="empty-state-title" style={{ fontSize: "var(--fs-xl)", margin: 0 }}>No trips found</div>
            <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-base)", maxWidth: "360px", margin: 0, textAlign: "center" }}>{query ? `No results for "${query}"` : "Start planning your first adventure. It only takes a minute to get started."}</p>
            <Link to={ROUTES.tripNew} className="btn btn-primary" style={{ marginTop: "var(--sp-sm)" }}>Plan your first trip</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)" }}>
            {trips.map((trip) => {
              const meta = STATUS_META[trip.status] ?? STATUS_META.planning;
              return (
                <Link key={trip.id} to={ROUTES.tripDetail(trip.id)} className="card card-hover trip-list-card" style={{ padding: "var(--sp-md)", display: "flex", alignItems: "center", gap: "var(--sp-xl)", textDecoration: "none", color: "var(--cl-text-on-surface)", border: "1px solid var(--cl-border)", background: "var(--cl-surface)", borderRadius: "var(--br-xl)" }}>
                  <div className="trip-list-thumb" style={{ width: "120px", height: "80px", borderRadius: "var(--br-lg)", overflow: "hidden", flexShrink: 0 }} aria-hidden>
                    <SmartImage
                      src={trip.coverPhotoUrl}
                      fallbackSrc={getTripCardCoverUrl(trip)}
                      alt=""
                      className="trip-list-thumb-img"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div className="trip-list-name" style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-xs)" }}>{trip.title}</div>
                    <div className="trip-list-meta" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--sp-lg)", color: "var(--cl-text-on-surface)", opacity: 0.7, fontSize: "var(--fs-sm)" }}>
                      <span className="trip-list-meta-item" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                        <span className={`trip-section-dot ${meta.dot}`} style={{ width: "8px", height: "8px", borderRadius: "50%", background: trip.status === "completed" ? "var(--cl-teal)" : trip.status === "ongoing" ? "var(--cl-warning)" : "var(--cl-accent)" }} /> 
                        <span style={{ fontWeight: "var(--fw-semibold)" }}>{meta.label}</span>
                      </span>
                      <span className="trip-list-meta-item" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={16} /> {formatDate(trip.startDate)} to {formatDate(trip.endDate)}</span>
                      <span className="trip-list-meta-item" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPinned size={16} /> {trip.tripType}</span>
                      {getTripBudget(trip) > 0 && <span className="trip-list-meta-item" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-accent)", fontWeight: "var(--fw-bold)", marginLeft: "auto" }}><Banknote size={16} /> {usd(getTripBudget(trip))}</span>}
                    </div>
                  </div>
                  
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--cl-bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cl-text-muted)" }}>
                    <ChevronRight size={20} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
