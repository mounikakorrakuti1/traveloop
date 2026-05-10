import { Building2, Search, MapPin } from "lucide-react";
import "@/styles/components/ui.css";

export default function CitiesPage() {
  return (
    <div className="trips-root">
      <div className="trips-header">
        <h1 className="trips-title">Explore Destinations</h1>
      </div>
      <div className="dashboard-search" style={{ marginBottom: "var(--sp-xl)" }}>
        <span className="dashboard-search-icon" style={{ display: "flex" }}><Search size={18} /></span>
        <input placeholder="Search for cities, landmarks, or regions…" />
      </div>
      <div className="notes-grid">
        {["Paris", "Tokyo", "New York", "London", "Rome", "Bali"].map((city) => (
          <div key={city} className="card card-hover">
            <div className="city-card-icon" style={{ color: "var(--cl-accent)", marginBottom: "var(--sp-sm)" }}><Building2 size={32} /></div>
            <h3 className="note-card-title">{city}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)" }}>
              <MapPin size={12} /> Popular Destination
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
