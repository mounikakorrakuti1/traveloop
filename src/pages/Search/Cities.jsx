import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { searchCities } from "@/api/cities.api";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { getCityLabel } from "@/lib/format";
import { SmartImage } from "@/components/shared/SmartImage";
import { getCityThumbnail } from "@/lib/cityImages";
import { uniqueDestinations } from "@/lib/dedupe";
import { useDebounce } from "@/hooks/useDebounce";
import { SkeletonCard } from "@/components/shared/Skeleton";
import { Search, MapPin, Compass } from "lucide-react";
import "@/styles/components/ui.css";

export default function CitiesPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query);
  const [region, setRegion] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.cities(debounced || "all"),
    queryFn: () => searchCities({ q: debounced || undefined, limit: 30 }),
    staleTime: 10 * 60 * 1000,
  });
  
  const cities = useMemo(() => uniqueDestinations(data?.cities ?? []), [data?.cities]);
  const regions = useMemo(() => ["all", ...Array.from(new Set(cities.map((city) => city.region).filter(Boolean)))], [cities]);
  const visibleCities = region === "all" ? cities : cities.filter((city) => city.region === region);

  return (
    <div className="trips-root" style={{ maxWidth: "var(--max-w-xl)", margin: "0 auto" }}>
      <div className="trips-header" style={{ marginBottom: "var(--sp-xl)", textAlign: "center" }}>
        <h1 className="trips-title" style={{ fontSize: "var(--fs-3xl)", marginBottom: "var(--sp-sm)" }}>Explore Destinations</h1>
        <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", maxWidth: "600px", margin: "0 auto" }}>
          Discover the most beautiful places in India. Plan your next adventure.
        </p>
      </div>

      <div className="dashboard-search" style={{ 
        marginBottom: "var(--sp-xl)", 
        maxWidth: "600px", 
        margin: "0 auto var(--sp-xl) auto",
        background: "var(--cl-surface)",
        boxShadow: "var(--shadow-sm)"
      }}>
        <span className="dashboard-search-icon" style={{ display: "flex", color: "var(--cl-accent)" }}><Search size={20} /></span>
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search cities, states, or regions..." 
          style={{ fontSize: "var(--fs-md)" }}
        />
      </div>

      {regions.length > 1 && (
        <div className="trips-filters" style={{ justifyContent: "center", marginBottom: "var(--sp-2xl)" }}>
          {regions.map((item) => (
            <button 
              key={item} 
              type="button" 
              className={`filter-tab${region === item ? " active" : ""}`} 
              onClick={() => setRegion(item)}
              style={{ padding: "var(--sp-sm) var(--sp-lg)", fontSize: "var(--fs-sm)" }}
            >
              {item === "all" ? "All Regions" : item}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="notes-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--sp-xl)" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} imageHeight="16rem" />
          ))}
        </div>
      ) : visibleCities.length === 0 ? (
        <div className="empty-state" style={{ padding: "var(--sp-4xl) var(--sp-xl)" }}>
          <Compass size={48} color="var(--cl-text-muted)" style={{ marginBottom: "var(--sp-md)" }} />
          <h3>No destinations found</h3>
          <p>We couldn't find any destinations matching your search.</p>
        </div>
      ) : (
        <div className="notes-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--sp-xl)" }}>
          {visibleCities.map((city) => (
            <Link key={city.id} to={ROUTES.cityDetail(city.id)} className="card card-hover city-card-link" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, overflow: "hidden", border: "none", boxShadow: "var(--shadow-sm)" }}>
              <div className="city-card-photo" style={{ height: "16rem", position: "relative" }}>
                <SmartImage 
                  src={city.thumbnailUrl} 
                  fallbackSrc={getCityThumbnail(city)} 
                  alt={city.name} 
                  className="city-card-img" 
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                />
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
                  pointerEvents: "none"
                }} />
                
                <div style={{
                  position: "absolute",
                  bottom: "var(--sp-md)",
                  left: "var(--sp-md)",
                  right: "var(--sp-md)",
                  color: "white"
                }}>
                  <h3 style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-2xs)", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                    {city.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-sm)", opacity: 0.9 }}>
                    <MapPin size={14} /> {getCityLabel(city)}
                  </div>
                </div>
              </div>
              
              <div style={{ padding: "var(--sp-md)", display: "flex", flexDirection: "column", gap: "var(--sp-sm)", flex: 1, background: "var(--cl-surface)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--sp-xs)" }}>
                  {city.bestSeason && <span style={{ background: "var(--cl-bg-subtle)", padding: "2px 8px", borderRadius: "var(--br-full)", fontSize: "var(--fs-xs)", color: "var(--cl-text)" }}>{city.bestSeason}</span>}
                  {city.areaType && <span style={{ background: "var(--cl-bg-subtle)", padding: "2px 8px", borderRadius: "var(--br-full)", fontSize: "var(--fs-xs)", color: "var(--cl-text)" }}>{city.areaType}</span>}
                  {city.costIndex && <span style={{ background: "var(--cl-accent-light)", padding: "2px 8px", borderRadius: "var(--br-full)", fontSize: "var(--fs-xs)", color: "var(--cl-accent)" }}>{city.costIndex}</span>}
                </div>
                {city.isRegionalGem && (
                  <div style={{ color: "var(--cl-teal)", fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semibold)", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                    ✨ Regional Gem
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
