import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPublicTrip } from "@/api/public.api";
import { MapView } from "@/components/itinerary/MapView";
import { CityPlaceImage } from "@/components/places/CityPlaceImage";
import { ROUTES } from "@/lib/constants";
import { formatDate, getCityLabel, getStopCity, getTripBudget, usd } from "@/lib/format";
import { Banknote, Calendar, Globe, Map, MapPin, Sparkles } from "lucide-react";
import "@/styles/components/itinerary.css";
import "@/styles/components/ui.css";

function setMeta(name, content, property = false) {
  if (!content) return;
  const attr = property ? "property" : "name";
  let tag = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export default function PublicItineraryPage() {
  const { slug } = useParams();
  const { data: trip, isLoading, isError } = useQuery({ queryKey: ["public-trip", slug ?? ""], queryFn: () => getPublicTrip(slug), enabled: Boolean(slug) });
  const stops = useMemo(() => trip?.stops ?? [], [trip?.stops]);
  const heroImage =
    trip?.coverPhotoUrl ||
    (() => {
      const s = stops.find((stop) => getStopCity(stop)?.thumbnailUrl);
      return getStopCity(s)?.thumbnailUrl;
    })() ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80";
  const destinationLine = useMemo(() => stops.map((stop) => getCityLabel(getStopCity(stop))).filter(Boolean).join(" · "), [stops]);

  useEffect(() => {
    if (!trip) return;
    const title = `${trip.title} | Traveloop Itinerary`;
    const description = trip.description || `Explore ${destinationLine || "this public trip"} with itinerary, budget, and map.`;
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:image", heroImage, true);
    setMeta("twitter:card", "summary_large_image");
  }, [destinationLine, heroImage, trip]);

  if (isLoading) {
    return (
      <div className="public-page">
        <div className="public-hero skeleton-hero" />
        <div className="public-content"><div className="empty-state">Preparing shared itinerary...</div></div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="itinerary-view-root" style={{ textAlign: "center", padding: "var(--sp-3xl) var(--sp-xl)" }}>
        <div style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-md)", display: "flex", justifyContent: "center" }}><Map size={64} /></div>
        <h1 className="itinerary-view-title" style={{ color: "var(--cl-text)" }}>Itinerary unavailable</h1>
        <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-xl)" }}>This itinerary may be private, unpublished, or the share link is invalid.</p>
        <Link to={ROUTES.landing} className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="public-page">
      <section className="public-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(18, 20, 31, 0.34), rgba(18, 20, 31, 0.78)), url(${heroImage})` }}>
        <div className="public-hero-inner">
          <div className="public-kicker"><Globe size={15} /> Public Traveloop itinerary</div>
          <h1>{trip.title}</h1>
          <p>{trip.description || destinationLine || "A thoughtfully planned shared journey."}</p>
          <div className="public-meta">
            <span><Calendar size={16} /> {formatDate(trip.startDate)} to {formatDate(trip.endDate)}</span>
            <span><MapPin size={16} /> {stops.length || 0} stops</span>
            <span><Banknote size={16} /> {getTripBudget(trip) ? usd(getTripBudget(trip)) : "Budget private"}</span>
          </div>
          <div className="public-actions">
            <Link to={ROUTES.signup} className="btn btn-primary btn-lg"><Sparkles size={16} /> Plan your own trip</Link>
            <Link to={ROUTES.login} className="btn btn-secondary btn-lg">Sign in</Link>
          </div>
        </div>
      </section>

      <main className="public-content">
        <MapView stops={stops} height="360px" />
        <section className="public-timeline">
          <h2>Itinerary Timeline</h2>
          {stops.length === 0 ? <div className="empty-state">This public trip has no visible stops yet.</div> : stops.map((stop, index) => {
            const city = getStopCity(stop);
            const activities = stop.activities || stop.stopActivities || [];
            return (
              <article key={stop.id} className="public-stop">
                <div className="public-stop-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="public-stop-body">
                  {city ? <CityPlaceImage city={city} className="place-thumb-public" alt={getCityLabel(city)} /> : null}
                  <div>
                    <h3>{getCityLabel(city)}</h3>
                    <p>{formatDate(stop.arrivalDate)} to {formatDate(stop.departureDate)} {stop.accommodationName ? `· ${stop.accommodationName}` : ""}</p>
                    {stop.notes && <p>{stop.notes}</p>}
                    {activities.length > 0 && <div className="public-activity-list">{activities.map((activity) => <span key={activity.id}>{activity.activity?.name || "Activity"}</span>)}</div>}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
