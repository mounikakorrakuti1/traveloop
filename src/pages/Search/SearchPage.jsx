import { useState } from "react";
import { useLocalState } from "@/lib/localStore";
import "@/styles/components/search.css";
import "@/styles/components/ui.css";
import { Search, Map, MapPin, Calendar, Clock, Plane, Umbrella, Castle, Mountain, Trees, Building2 } from "lucide-react";

const filters = ["All", "Trips", "Destinations", "Activities", "Notes"];
const popular = ["Goa", "Jaipur", "Manali", "Kerala", "Udaipur"];

const ICONS = {
  Goa: Umbrella, Jaipur: Castle, Manali: Mountain, Kerala: Trees,
  Udaipur: Building2, Mysuru: Castle, Shillong: Trees, Ladakh: Mountain,
};

export default function SearchPage() {
  const [localState, setLocalState] = useLocalState();
  const [query, setQuery]   = useState("");
  const [filter, setFilter] = useState("All");

  const addToHistory = (value) => {
    if (!value.trim()) return;
    setLocalState((cur) => ({
      ...cur,
      searchOptions: [value, ...cur.searchOptions.filter((s) => s !== value)].slice(0, 10),
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    addToHistory(query);
  };

  /* Combine trips + history as mock results */
  const results = query.trim()
    ? localState.trips.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          (t.place || "").toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="search-root">
      {/* Hero */}
      <div className="search-hero">
        <h1 className="search-title">Discover &amp; Search</h1>
        <p className="search-subtitle">Find trips, destinations, activities, and more</p>

        <form className="search-bar-wrap" onSubmit={handleSearch}>
          <span className="search-bar-icon" style={{ display: "flex" }}><Search size={18} /></span>
          <input
            className="search-bar-input"
            placeholder="Search destinations, trips…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cl-text-muted)" }}
            >
              ✕
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="search-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`search-filter-chip${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {query ? (
        <>
          <div className="search-results-header">
            <h2 className="search-results-title">Results for "{query}"</h2>
            <span className="search-results-count">{results.length} found</span>
          </div>

          {results.length > 0 ? (
            <div className="search-results-grid">
              {results.map((trip) => (
                <div key={trip.id} className="search-result-card">
                  <div className="search-result-thumb">
                    {(() => {
                      const IconComponent = ICONS[trip.place] || Map;
                      return <IconComponent size={24} />;
                    })()}
                  </div>
                  <div className="search-result-body">
                    <div className="search-result-name">{trip.title}</div>
                    <div className="search-result-meta">
                      <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={14} /> {trip.place || "TBD"}</span>
                      {trip.startDate && <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={14} /> {trip.startDate}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={48} /></div>
              <div className="empty-state-title">No results for "{query}"</div>
              <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
                Try a different search term or browse popular destinations below.
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Popular destinations */}
          <h2 className="search-results-title" style={{ marginBottom: "var(--sp-md)" }}>
            Popular Destinations
          </h2>
          <div className="search-results-grid" style={{ marginBottom: "var(--sp-xl)" }}>
            {popular.map((d) => (
              <div
                key={d}
                className="search-result-card"
                onClick={() => { setQuery(d); addToHistory(d); }}
              >
                <div className="search-result-thumb">
                  {(() => {
                    const IconComponent = ICONS[d] || Map;
                    return <IconComponent size={24} />;
                  })()}
                </div>
                <div className="search-result-body">
                  <div className="search-result-name">{d}</div>
                  <div className="search-result-meta">
                    <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={14} /> India</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Plane size={14} /> Popular</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search history */}
          {localState.searchOptions.length > 0 && (
            <>
              <div className="search-history-label">Recent Searches</div>
              {localState.searchOptions.slice(0, 5).map((s) => (
                <div
                  key={s}
                  className="search-history-item"
                  onClick={() => setQuery(s)}
                >
                  <span style={{ display: "flex", color: "var(--cl-text-muted)" }}><Clock size={16} /></span>
                  {s}
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
