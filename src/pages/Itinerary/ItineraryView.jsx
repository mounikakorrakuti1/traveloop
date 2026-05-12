import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTrip } from "@/api/trips.api";
import { listStops } from "@/api/stops.api";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { formatDate, getCityLabel, getStopCity, usd } from "@/lib/format";
import { useMap } from "@/hooks/useMap";
import { MapView } from "@/components/itinerary/MapView";
import { CityPlaceImage } from "@/components/places/CityPlaceImage";
import "@/styles/components/itinerary.css";
import "@/styles/components/ui.css";
import { MapPin, Calendar } from "lucide-react";

export default function ItineraryViewPage() {
  const { id } = useParams();
  const { data: trip } = useQuery({ queryKey: QUERY_KEYS.trip(id ?? ""), queryFn: () => getTrip(id), enabled: Boolean(id) });
  const { data: stops = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.stops(id ?? ""), queryFn: () => listStops(id), enabled: Boolean(id) });
  const { data: routeData } = useMap(id);

  return (
    <div className="itinerary-view-root">
      <div className="itinerary-view-header">
        <div className="itinerary-view-place" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--sp-xs)" }}><MapPin size={16} /> Itinerary Overview</div>
        <h1 className="itinerary-view-title">{trip?.title || "Your Trip"}</h1>
        <div style={{ display: "flex", gap: "var(--sp-lg)", justifyContent: "center", marginTop: "var(--sp-md)" }}>
          <div style={{ textAlign: "center" }}><div style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-warm)" }}>{stops.length}</div><div style={{ fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.55)" }}>Stops</div></div>
        </div>
        <div style={{ marginTop: "var(--sp-md)" }}><Link to={ROUTES.tripItinerary(id)} className="btn btn-secondary">Edit itinerary</Link></div>
      </div>

      <MapView stops={stops} routeData={routeData} height="360px" />

      {isLoading ? (
        <div className="empty-state">Loading itinerary...</div>
      ) : stops.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><Calendar size={48} /></div><div className="empty-state-title">No itinerary yet</div></div>
      ) : (
        stops.map((stop, index) => {
          const city = getStopCity(stop);
          return (
            <div key={stop.id} className="day-block">
              <div className="day-label-col"><div className="day-label">Stop {index + 1}<div style={{ fontSize: "var(--fs-xs)", opacity: 0.6, marginTop: "2px" }}>{formatDate(stop.arrivalDate)}</div></div></div>
              <div className="day-activities">
                <div className="activity-row">
                  {city ? <CityPlaceImage city={city} className="place-thumb place-thumb-lg" alt={getCityLabel(city)} /> : null}
                  <div className="activity-row-text">
                    <div>
                      <div className="activity-name">{getCityLabel(city)}</div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", marginTop: "2px" }}>{formatDate(stop.arrivalDate)} to {formatDate(stop.departureDate)}</div>
                      {stop.notes && <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", marginTop: "2px" }}>{stop.notes}</div>}
                      {((stop.activities || stop.stopActivities) || []).map((sa) => (
                        <div key={sa.id} style={{ marginTop: "var(--sp-xs)", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                          {sa.activity?.imageUrl ? (
                            <img src={sa.activity.imageUrl} alt="" className="place-thumb" style={{ width: 48, height: 48 }} loading="lazy" />
                          ) : null}
                          <span>
                            - {sa.activity?.name || "Activity"} {sa.actualCostInr ? `(${usd(sa.actualCostInr)})` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="activity-cost">{stop.accommodationCostInr ? usd(stop.accommodationCostInr) : ""}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
