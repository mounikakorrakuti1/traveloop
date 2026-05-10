import { useLocalState } from "@/lib/localStore";
import "@/styles/components/itinerary.css";
import "@/styles/components/ui.css";
import { MapPin, Calendar, Pin } from "lucide-react";

export default function ItineraryViewPage() {
  const [localState] = useLocalState();

  /* Group sections by dateRange */
  const days = Object.entries(
    localState.itinerarySections.reduce((acc, section) => {
      const key = section.dateRange || "Unscheduled";
      acc[key] = [...(acc[key] || []), section];
      return acc;
    }, {})
  );

  return (
    <div className="itinerary-view-root">
      {/* Header */}
      <div className="itinerary-view-header">
        <div className="itinerary-view-place" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--sp-xs)" }}><MapPin size={16} /> Itinerary Overview</div>
        <h1 className="itinerary-view-title">Your Trip at a Glance</h1>
        <div style={{ display: "flex", gap: "var(--sp-lg)", justifyContent: "center", marginTop: "var(--sp-md)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-warm)" }}>
              {localState.itinerarySections.length}
            </div>
            <div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)" }}>Stops</div>
          </div>
          <div style={{ width: "1px", background: "rgba(244,241,222,0.1)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-teal)" }}>
              ₹{localState.itinerarySections.reduce((s, sec) => s + (Number(sec.budget) || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)" }}>Est. Budget</div>
          </div>
          <div style={{ width: "1px", background: "rgba(244,241,222,0.1)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-accent)" }}>
              {days.length}
            </div>
            <div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)" }}>Days</div>
          </div>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Calendar size={48} /></div>
          <div className="empty-state-title">No itinerary yet</div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
            Go to the builder to add stops to your trip.
          </p>
        </div>
      ) : (
        days.map(([day, items], dayIndex) => (
          <div key={day} className="day-block">
            <div className="day-label-col">
              <div className="day-label">
                {day === "Unscheduled" ? <span style={{ display: "flex", justifyContent: "center" }}><Pin size={18} /></span> : `Day ${dayIndex + 1}`}
                <div style={{ fontSize: "var(--fs-xs)", opacity: 0.6, marginTop: "2px" }}>{day === "Unscheduled" ? "" : day}</div>
              </div>
            </div>

            <div className="day-activities">
              {items.map((item) => (
                <div key={item.id} className="activity-row">
                  <div>
                    <div className="activity-name">{item.title}</div>
                    {item.info && (
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", marginTop: "2px" }}>
                        {item.info}
                      </div>
                    )}
                  </div>
                  <div className="activity-cost">
                    {item.budget ? `₹${Number(item.budget).toLocaleString()}` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
