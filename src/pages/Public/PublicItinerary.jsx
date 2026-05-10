import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { copyPublicTrip, getPublicTrip } from "@/api/public.api";
import { ROUTES } from "@/lib/constants";
import { useToast } from "@/components/shared/toast-context";
import { Map, MapPin, Globe, Copy } from "lucide-react";
import "@/styles/components/itinerary.css";
import "@/styles/components/ui.css";

export default function PublicItineraryPage() {
  const { slug }    = useParams();
  const { showToast } = useToast();

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ["public-trip", slug ?? ""],
    queryFn:  () => getPublicTrip(slug),
    enabled:  Boolean(slug),
  });

  const handleCopy = async () => {
    if (!slug) return;
    try {
      await copyPublicTrip(slug);
      showToast("Trip copied to your account! Visit your Trips to see it.", "success");
    } catch {
      showToast("Failed to copy trip. You might need to sign in first.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="itinerary-view-root">
        <div className="itinerary-view-header">
          <div className="itinerary-view-place">Loading adventure…</div>
          <div className="itinerary-view-title" style={{ opacity: 0.5 }}>Please wait</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="activity-row" style={{ height: "4rem", opacity: 0.3 }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="itinerary-view-root" style={{ textAlign: "center", padding: "var(--sp-3xl) var(--sp-xl)" }}>
        <div style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-md)", display: "flex", justifyContent: "center" }}><Map size={64} /></div>
        <h1 className="itinerary-view-title" style={{ color: "var(--cl-text)" }}>Itinerary Unavailable</h1>
        <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-xl)" }}>
          This itinerary may be private or the link has expired.
        </p>
        <Link to={ROUTES.landing} className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  /* Group stops by day if they have dates, else one block */
  const stops = trip.stops || [];

  return (
    <div className="itinerary-view-root" style={{ background: "var(--cl-bg)", minHeight: "100vh" }}>
      {/* Public Banner */}
      <div style={{
        background: "var(--cl-accent)",
        color: "#fff",
        padding: "var(--sp-xs) var(--sp-md)",
        fontSize: "var(--fs-xs)",
        fontWeight: "var(--fw-bold)",
        textAlign: "center",
        letterSpacing: "var(--ls-wide)",
        textTransform: "uppercase",
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)" }}><Globe size={14} /> Public Itinerary Shared by {trip.authorName || "an Explorer"}</span>
      </div>

      {/* Header */}
      <div className="itinerary-view-header">
        <div className="itinerary-view-place" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--sp-xs)" }}><MapPin size={16} /> {trip.place || "Destination"}</div>
        <h1 className="itinerary-view-title">{trip.title}</h1>

        <div style={{ display: "flex", gap: "var(--sp-lg)", justifyContent: "center", marginTop: "var(--sp-xl)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-warm)" }}>
              {stops.length}
            </div>
            <div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)" }}>Stops</div>
          </div>
          <div style={{ width: "1px", background: "rgba(244,241,222,0.1)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-teal)" }}>
              ₹{trip.budget?.toLocaleString() || "—"}
            </div>
            <div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)" }}>Budget</div>
          </div>
        </div>

        <div style={{ marginTop: "var(--sp-xl)", display: "flex", justifyContent: "center", gap: "var(--sp-md)" }}>
          <button className="btn btn-primary btn-lg" onClick={handleCopy}>
            <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Copy size={18} /> Copy to My Account</span>
          </button>
          <Link to={ROUTES.signup} className="btn btn-secondary btn-lg" style={{ borderColor: "rgba(244,241,222,0.2)" }}>
            Join Travel-Loop
          </Link>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ maxWidth: "var(--max-w-xl)", margin: "0 auto" }}>
        {stops.length === 0 ? (
          <div className="empty-state">
            <p style={{ color: "var(--cl-text-muted)" }}>No stops added to this itinerary yet.</p>
          </div>
        ) : (
          stops.map((stop, i) => (
            <div key={stop.id || i} className="day-block">
              <div className="day-label-col">
                <div className="day-label">
                  Stop {i + 1}
                </div>
              </div>

              <div className="day-activities">
                <div className="activity-row">
                  <div>
                    <div className="activity-name">{stop.title || "Untitled Stop"}</div>
                    {stop.description && (
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", marginTop: "var(--sp-xs)", lineHeight: "var(--lh-body)" }}>
                        {stop.description}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "var(--sp-sm)", marginTop: "var(--sp-sm)" }}>
                      {stop.location && (
                        <span style={{ fontSize: "var(--fs-xs)", color: "var(--cl-accent)", fontWeight: "var(--fw-medium)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={14} /> {stop.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="activity-cost">
                    {stop.budget ? `₹${Number(stop.budget).toLocaleString()}` : ""}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer CTA */}
      <div style={{
        marginTop: "var(--sp-3xl)",
        padding: "var(--sp-2xl) var(--sp-xl)",
        background: "var(--cl-bg-alt)",
        textAlign: "center",
        borderTop: "1px solid var(--cl-border)",
      }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-text)", marginBottom: "var(--sp-md)" }}>
          Want to plan your own trip?
        </h3>
        <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-xl)", maxWidth: "30rem", marginInline: "auto" }}>
          Travel-Loop helps you build itineraries, track budgets, and share adventures with the community.
        </p>
        <Link to={ROUTES.signup} className="btn btn-primary">Start Planning Free →</Link>
      </div>
    </div>
  );
}
