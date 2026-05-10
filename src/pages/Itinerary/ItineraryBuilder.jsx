import { makeId, useLocalState } from "@/lib/localStore";
import "@/styles/components/itinerary.css";
import "@/styles/components/ui.css";
import { Calendar, Trash2, Plus } from "lucide-react";

export default function ItineraryBuilderPage() {
  const [localState, setLocalState] = useLocalState();
  const sections = localState.itinerarySections;

  const updateSection = (id, key, value) =>
    setLocalState((cur) => ({
      ...cur,
      itinerarySections: cur.itinerarySections.map((s) =>
        s.id === id ? { ...s, [key]: value } : s
      ),
    }));

  const addSection = () =>
    setLocalState((cur) => ({
      ...cur,
      itinerarySections: [
        ...cur.itinerarySections,
        { id: makeId("sec"), title: "New Stop", dateRange: "", budget: 0, info: "Add details about this stop…" },
      ],
    }));

  const removeSection = (id) =>
    setLocalState((cur) => ({
      ...cur,
      itinerarySections: cur.itinerarySections.filter((s) => s.id !== id),
    }));

  return (
    <div className="itinerary-root">
      {/* Header */}
      <div className="itinerary-header">
        <h1 className="itinerary-title">Itinerary Builder</h1>
        <button className="btn btn-primary" onClick={addSection}>
          + Add Stop
        </button>
      </div>

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Calendar size={48} /></div>
          <div className="empty-state-title">No stops yet</div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
            Add your first stop to start building your itinerary.
          </p>
          <button className="btn btn-primary" onClick={addSection}>
            + Add First Stop
          </button>
        </div>
      ) : (
        sections.map((section, index) => (
          <div key={section.id} className="stop-card">
            <div className="stop-card-header">
              <div className="stop-card-number">{String(index + 1).padStart(2, "0")}</div>
              <input
                className="stop-card-title"
                value={section.title}
                onChange={(e) => updateSection(section.id, "title", e.target.value)}
                placeholder="Stop name…"
              />
              <div className="stop-card-actions">
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => removeSection(section.id)}
                  title="Remove stop"
                  style={{ color: "var(--cl-error)" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="stop-card-body">
              <textarea
                className="stop-card-desc"
                value={section.info}
                onChange={(e) => updateSection(section.id, "info", e.target.value)}
                placeholder="Notes, highlights, things to do…"
                rows={3}
              />

              <div className="stop-card-meta">
                <div className="input-wrap">
                  <label className="input-label">Date Range</label>
                  <input
                    className="input"
                    placeholder="e.g., Day 1 → Day 2"
                    value={section.dateRange}
                    onChange={(e) => updateSection(section.id, "dateRange", e.target.value)}
                  />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Estimated Budget (₹)</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="0"
                    value={section.budget || ""}
                    onChange={(e) => updateSection(section.id, "budget", Number(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {sections.length > 0 && (
        <button className="add-section-btn" type="button" onClick={addSection}>
          <span style={{ display: "flex" }}><Plus size={18} /></span>
          Add another stop
        </button>
      )}

      {sections.length > 0 && (
        <div style={{ display: "flex", gap: "var(--sp-md)", flexWrap: "wrap" }}>
          <div style={{ flex: 1, background: "var(--cl-surface)", border: "1px solid var(--cl-border-surface)", borderRadius: "var(--br-xl)", padding: "var(--sp-lg)", color: "var(--cl-text-on-surface)" }}>
            <div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)", marginBottom: "var(--sp-xs)" }}>Total Stops</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)" }}>{sections.length}</div>
          </div>
          <div style={{ flex: 1, background: "var(--cl-surface)", border: "1px solid var(--cl-border-surface)", borderRadius: "var(--br-xl)", padding: "var(--sp-lg)", color: "var(--cl-text-on-surface)" }}>
            <div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)", marginBottom: "var(--sp-xs)" }}>Estimated Budget</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--cl-warm)" }}>
              ₹{sections.reduce((s, sec) => s + (Number(sec.budget) || 0), 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
