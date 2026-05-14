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

const FALLBACK_TRENDING = [
  { id: "paris", name: "Paris", latitude: 48.8566, longitude: 2.3522, country: "France" },
  { id: "tokyo", name: "Tokyo", latitude: 35.6762, longitude: 139.6503, country: "Japan" },
  { id: "nyc", name: "New York", latitude: 40.7128, longitude: -74.0060, country: "USA" },
  { id: "london", name: "London", latitude: 51.5074, longitude: -0.1278, country: "UK" },
  { id: "rome", name: "Rome", latitude: 41.9028, longitude: 12.4964, country: "Italy" },
  { id: "sydney", name: "Sydney", latitude: -33.8688, longitude: 151.2093, country: "Australia" },
];

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
  
  // Showcase trending cities when search is empty
  const trendingCitiesQuery = useQuery({ 
    queryKey: ["cities-trending"], 
    queryFn: () => searchCities({ limit: 8 }), 
    enabled: !enabled,
    staleTime: 60 * 60 * 1000 
  });

  const tripResults = tripsQuery.data?.trips ?? [];
  const cityResults = uniqueDestinations(citiesQuery.data?.cities ?? []);
  const activityResults = activitiesQuery.data?.activities ?? [];
  const dbTrending = uniqueDestinations(trendingCitiesQuery.data?.cities ?? []);
  const trendingResults = dbTrending.length > 0 ? dbTrending : FALLBACK_TRENDING;
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
      ) : (
        <div className="search-trending">
          <div className="search-results-header"><h2 className="search-results-title">Trending Destinations</h2></div>
          <div className="search-results-grid">
            {trendingResults.map((city) => (
              <Link key={city.id || city.name} to={city.id ? ROUTES.cityDetail(city.id) : ROUTES.search} className="search-result-card">
                <div className="search-result-thumb">
                  <CityPlaceImage city={city} alt={getCityLabel(city)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="search-result-body">
                  <div className="search-result-name">{city.name}</div>
                  <div className="search-result-meta">{city.country || getCityLabel(city)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
