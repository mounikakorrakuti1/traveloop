import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchActivities } from "@/api/activities.api";
import { searchCities } from "@/api/cities.api";
import { listTrips } from "@/api/trips.api";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { getCityLabel, usd, activityEstimatedInr } from "@/lib/format";
import { getTripCardCoverUrl } from "@/lib/tripCover";
import { SmartImage } from "@/components/shared/SmartImage";
import { CityPlaceImage } from "@/components/places/CityPlaceImage";
import { getCityFromTitle } from "@/lib/cityImages";
import { uniqueDestinations } from "@/lib/dedupe";
import { useDebounce } from "@/hooks/useDebounce";
import { CityImageThumb } from "@/components/shared/CityImageThumb";
import "@/styles/components/search.css";
import "@/styles/components/ui.css";
import { Search, Calendar } from "lucide-react";

const filters = ["All", "Trips", "Destinations", "Activities"];

function ActivityResultCard({ activity }) {
  const city = activity.city?.name || activity.city || getCityFromTitle(activity.name || activity.title);

  return (
    <div className="search-result-card">
      <div className="search-result-thumb">
        <CityImageThumb city={activity.city || { name: city }} title={activity.name} />
      </div>
      <div className="search-result-body">
        <div className="search-result-name">{activity.name}</div>
        <div className="search-result-meta">{activity.category} — {usd(activityEstimatedInr(activity))}</div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const debounced = useDebounce(query);
  const enabled = debounced.trim().length >= 2;

  const tripsQuery = useQuery({ queryKey: QUERY_KEYS.trips({ search: debounced }), queryFn: () => listTrips({ search: debounced, limit: 10 }), enabled: enabled && ["All", "Trips"].includes(filter) });
  const citiesQuery = useQuery({ queryKey: QUERY_KEYS.cities(debounced), queryFn: () => searchCities({ q: debounced, limit: 10 }), enabled: enabled && ["All", "Destinations"].includes(filter), staleTime: 10 * 60 * 1000 });
  const activitiesQuery = useQuery({ queryKey: QUERY_KEYS.activities({ q: debounced }), queryFn: () => searchActivities({ q: debounced, limit: 10 }), enabled: enabled && ["All", "Activities"].includes(filter) });

  const tripResults = tripsQuery.data?.trips ?? [];
  const cityResults = uniqueDestinations(citiesQuery.data?.cities ?? []);
  const activityResults = activitiesQuery.data?.activities ?? [];
  const total = tripResults.length + cityResults.length + activityResults.length;

  return (
    <div className="search-root">
      <div className="search-hero">
        <h1 className="search-title">Discover &amp; Search</h1>
        <p className="search-subtitle">Find saved trips, backend city data, and seeded activities</p>
        <div className="search-bar-wrap">
          <span className="search-bar-icon" style={{ display: "flex" }}><Search size={18} /></span>
          <input className="search-bar-input" placeholder="Search destinations, trips, activities" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && <button type="button" onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cl-text-muted)" }}>x</button>}
        </div>
        <div className="search-filters">{filters.map((f) => <button key={f} className={`search-filter-chip${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>{f}</button>)}</div>
      </div>

      {enabled ? (
        <>
          <div className="search-results-header"><h2 className="search-results-title">Results for "{query}"</h2><span className="search-results-count">{total} found</span></div>
          {total === 0 ? <div className="empty-state">No matching backend records found.</div> : (
            <div className="search-results-grid">
              {tripResults.map((trip) => (
                <Link key={trip.id} to={ROUTES.tripDetail(trip.id)} className="search-result-card">
                  <div className="search-result-thumb">
                    <SmartImage
                      src={trip.coverPhotoUrl}
                      fallbackSrc={getTripCardCoverUrl(trip)}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div className="search-result-body">
                    <div className="search-result-name">{trip.title}</div>
                    <div className="search-result-meta"><Calendar size={14} /> {trip.startDate}</div>
                  </div>
                </Link>
              ))}
              {cityResults.map((city) => (
                <Link key={city.id} to={ROUTES.cityDetail(city.id)} className="search-result-card">
                  <div className="search-result-thumb">
                    <CityPlaceImage city={city} alt={getCityLabel(city)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div className="search-result-body">
                    <div className="search-result-name">{city.name}</div>
                    <div className="search-result-meta">{getCityLabel(city)}</div>
                  </div>
                </Link>
              ))}
              {activityResults.map((activity) => <ActivityResultCard key={activity.id} activity={activity} />)}
            </div>
          )}
        </>
      ) : <div className="empty-state">Type at least two characters to search live backend data.</div>}
    </div>
  );
}
