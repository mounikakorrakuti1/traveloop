import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { makeId, useLocalState } from "@/lib/localStore";
import "@/styles/components/ui.css";
import { Sparkles, Umbrella, Castle, Mountain, Trees, Building2, Rocket } from "lucide-react";

const suggestions = [
  { name: "Goa Beaches",    icon: Umbrella, desc: "Sun, sand & seafood" },
  { name: "Jaipur Heritage",icon: Castle, desc: "Palaces & pink city" },
  { name: "Manali Trek",    icon: Mountain, desc: "Snow peaks & valleys" },
  { name: "Kerala Backwaters",icon: Trees, desc: "Houseboats & spice" },
  { name: "Udaipur Lakes",  icon: Building2, desc: "Romantic lakeside city" },
  { name: "Ladakh Desert",  icon: Mountain, desc: "The roof of the world" },
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [, setLocalState] = useLocalState();
  const [form, setForm] = useState({ title: "", place: "", startDate: "", endDate: "", budget: "" });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const createTrip = (e) => {
    e.preventDefault();
    const id = makeId("trip");
    setLocalState((cur) => ({
      ...cur,
      trips: [{
        id,
        title:     form.title || form.place || "Untitled Trip",
        place:     form.place || "TBD",
        status:    "upcoming",
        startDate: form.startDate,
        endDate:   form.endDate,
        budget:    Number(form.budget) || 0,
        overview:  "",
      }, ...cur.trips],
    }));
    navigate(ROUTES.tripItinerary(id));
  };

  return (
    <div className="create-trip-root">
      {/* ── Main form ──────────────────────────────────── */}
      <div className="create-trip-form-card">
        <h1 className="create-trip-title">Plan a New Trip</h1>
        <p className="create-trip-sub">
          Fill in the details below to get started. You can always update them later.
        </p>

        <form className="create-trip-fields" onSubmit={createTrip}>
          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-title">Trip Name</label>
            <input
              id="ct-title"
              className="input"
              placeholder="e.g., Goa Weekend Escape"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-place">Destination</label>
            <input
              id="ct-place"
              className="input"
              placeholder="e.g., Goa, India"
              value={form.place}
              onChange={(e) => update("place", e.target.value)}
            />
          </div>

          <div className="create-trip-row">
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-start">Start Date</label>
              <input
                id="ct-start"
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
              />
            </div>
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-end">End Date</label>
              <input
                id="ct-end"
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-budget">Budget (₹)</label>
            <input
              id="ct-budget"
              type="number"
              className="input"
              placeholder="e.g., 25000"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "var(--sp-md)", marginTop: "var(--sp-sm)" }}>
            <Link to={ROUTES.home} className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }}>
              ← Cancel
            </Link>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, display: "flex", gap: "var(--sp-xs)", alignItems: "center", justifyContent: "center" }}>
              Create Trip <Rocket size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* ── Suggestions panel ──────────────────────────── */}
      <div className="suggestions-panel">
        <div className="suggestions-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)" }}>
          <Sparkles size={20} color="var(--cl-warm)" /> Suggested Destinations
        </div>
        <p style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)", marginBottom: "var(--sp-md)", lineHeight: "var(--lh-body)" }}>
          Click a destination to auto-fill your trip details.
        </p>
        {suggestions.map((s) => (
          <button
            key={s.name}
            className="suggestion-chip"
            type="button"
            onClick={() => update("place", s.name)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)" }}>
              <span style={{ display: "flex", color: "var(--cl-accent)" }}><s.icon size={24} /></span>
              <div>
                <div style={{ fontWeight: "var(--fw-semibold)", color: "var(--cl-text-on-surface)", fontSize: "var(--fs-sm)", textAlign: "left" }}>
                  {s.name}
                </div>
                <div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.5)" }}>
                  {s.desc}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
