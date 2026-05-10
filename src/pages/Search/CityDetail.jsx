import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCityById } from "@/api/cities.api";
import { SmartImage } from "@/components/shared/SmartImage";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/shared/Skeleton";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { getCityImages } from "@/lib/cityImages";
import { getDestinationData } from "@/lib/destinationData";
import { searchTransport } from "@/lib/transportData";
import { usd } from "@/lib/format";
import { MapPin, Thermometer, Info, ShieldAlert, Navigation, Star, Palmtree, Utensils, IndianRupee } from "lucide-react";
import "@/styles/components/ui.css";
import "@/styles/components/destination.css";

function budgetFromCostIndex(costIndex) {
  if (costIndex === "high") return "₹15,000/day";
  if (costIndex === "low") return "₹3,500/day";
  return "₹6,000/day";
}

export default function CityDetailPage() {
  const { id } = useParams();
  const [transportMode, setTransportMode] = useState("all");

  const cityQuery = useQuery({
    queryKey: QUERY_KEYS.cityDetail(id),
    queryFn: () => getCityById(id),
    enabled: Boolean(id)
  });

  const city = cityQuery.data;
  const cityName = city?.name || "Destination";
  
  // Use rich offline data as primary source for intelligence
  const destData = useMemo(() => getDestinationData(cityName), [cityName]);
  const images = useMemo(() => getCityImages(cityName), [cityName]);
  const heroImage = city?.thumbnailUrl || images.hero;

  const transportRoutes = useMemo(() => {
    if (!city?.name) return [];
    // Just simulating a search from Delhi or Mumbai to this city for demo purposes
    const origin = ["Delhi", "Mumbai", "Bengaluru"].includes(city.name) ? "Hyderabad" : "Delhi";
    return searchTransport(origin, city.name, transportMode);
  }, [city?.name, transportMode]);

  if (cityQuery.isLoading) {
    return (
      <div className="destination-root">
        <Skeleton w="100%" h="400px" rounded="none" style={{ marginBottom: "var(--sp-xl)" }} />
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 var(--sp-xl)" }}>
          <Skeleton w="40%" h="3rem" style={{ marginBottom: "var(--sp-sm)" }} />
          <Skeleton w="20%" h="1.5rem" style={{ marginBottom: "var(--sp-xl)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "var(--sp-2xl)" }}>
            <div>
              <SkeletonText lines={4} />
              <div style={{ marginTop: "var(--sp-2xl)" }} />
              <SkeletonText lines={6} />
            </div>
            <div>
              <SkeletonCard imageHeight="200px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="destination-root">
      {/* ── Hero Section ──────────────────────────────────── */}
      <div className="destination-hero">
        <SmartImage
          src={heroImage}
          fallbackSrc={images.hero}
          alt={cityName}
          className="destination-hero-bg"
        />
        <div className="destination-hero-overlay" />
        <div className="destination-hero-content">
          <Link to={ROUTES.cities} className="destination-back">← All Destinations</Link>
          <div className="destination-hero-meta">
            <span className="badge badge-glass"><MapPin size={14} /> {city?.state || "India"}</span>
            {city?.isRegionalGem && <span className="badge badge-glass-accent"><Star size={14} /> Regional Gem</span>}
          </div>
          <h1 className="destination-title">{cityName}</h1>
          <p className="destination-tagline">{destData?.tagline || [city?.state, city?.country].filter(Boolean).join(", ")}</p>
        </div>
      </div>

      <div className="destination-container">
        {/* ── Main Content Area ───────────────────────────── */}
        <div className="destination-grid">
          <div className="destination-main">
            
            {/* Description */}
            <section className="destination-section">
              <h2 className="section-title">About {cityName}</h2>
              <p className="destination-description">{destData?.description || "A beautiful destination waiting to be explored. Traveloop AI is currently gathering more insights about this location."}</p>
            </section>

            {/* Famous Places */}
            {destData?.famousPlaces && (
              <section className="destination-section">
                <h2 className="section-title"><Palmtree size={20} className="section-icon" /> Must-Visit Places</h2>
                <div className="places-grid">
                  {destData.famousPlaces.map((place, i) => (
                    <div key={i} className="place-card">
                      {place.image && (
                        <div className="place-image-wrap">
                          <img src={place.image} alt={place.name} className="place-image" />
                        </div>
                      )}
                      <div className="place-content">
                        <h3 className="place-name">{place.name}</h3>
                        <p className="place-desc">{place.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Top Attractions & Hidden Gems */}
            <div className="highlights-grid">
              {destData?.topAttractions && (
                <div className="highlight-card">
                  <h3>Top Activities</h3>
                  <ul className="highlight-list">
                    {destData.topAttractions.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              {destData?.hiddenGems && (
                <div className="highlight-card accent">
                  <h3>Local Hidden Gems</h3>
                  <ul className="highlight-list">
                    {destData.hiddenGems.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Transport Routes */}
            <section className="destination-section">
              <div className="section-header-row">
                <h2 className="section-title"><Navigation size={20} className="section-icon" /> Getting There</h2>
                <div className="transport-tabs">
                  {["all", "flight", "train", "bus"].map((mode) => (
                    <button 
                      key={mode} 
                      className={`transport-tab ${transportMode === mode ? "active" : ""}`}
                      onClick={() => setTransportMode(mode)}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {transportRoutes.length > 0 ? (
                <div className="transport-list">
                  {transportRoutes.map((route) => (
                    <div key={route.id} className="transport-card">
                      <div className="transport-provider">
                        <img src={route.providerLogo} alt={route.provider} className="provider-logo" />
                        <div className="provider-details">
                          <span className="provider-name">{route.provider}</span>
                          <span className="provider-type">{route.type}</span>
                        </div>
                      </div>
                      <div className="transport-times">
                        <div className="time-block">
                          <span className="time">{route.departureTime}</span>
                          <span className="city">{route.from}</span>
                        </div>
                        <div className="time-duration">
                          <span className="duration-line"></span>
                          <span className="duration-text">{route.duration}</span>
                        </div>
                        <div className="time-block right">
                          <span className="time">{route.arrivalTime}</span>
                          <span className="city">{route.to}</span>
                        </div>
                      </div>
                      <div className="transport-price-action">
                        <span className="price">₹{route.price.toLocaleString()}</span>
                        <button className="btn btn-primary btn-sm">Book</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state minimal">
                  <p>No {transportMode !== 'all' ? transportMode : ''} routes available for this search criteria.</p>
                </div>
              )}
            </section>

          </div>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <div className="destination-sidebar">
            {/* Quick Info Card */}
            <div className="info-card quick-facts">
              <h3 className="info-title"><Info size={18} /> Quick Facts</h3>
              
              <div className="fact-item">
                <Thermometer className="fact-icon" size={18} />
                <div>
                  <div className="fact-label">Best Time to Visit</div>
                  <div className="fact-value">{destData?.bestTimeToVisit || city?.bestSeason || "October to March"}</div>
                </div>
              </div>
              
              <div className="fact-item">
                <IndianRupee className="fact-icon" size={18} />
                <div>
                  <div className="fact-label">Est. Daily Budget</div>
                  <div className="fact-value">{destData?.estimatedBudget?.mid || budgetFromCostIndex(city?.costIndex)}</div>
                </div>
              </div>

              {destData?.weather && (
                <div className="weather-mini">
                  <div className="weather-item">
                    <span>☀️ Summer</span>
                    <span>{destData.weather.summer}</span>
                  </div>
                  <div className="weather-item">
                    <span>❄️ Winter</span>
                    <span>{destData.weather.winter}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Restaurants */}
            {destData?.restaurants && (
              <div className="info-card">
                <h3 className="info-title"><Utensils size={18} /> Top Restaurants</h3>
                <div className="restaurant-list">
                  {destData.restaurants.map((rest, i) => (
                    <div key={i} className="restaurant-item">
                      <div className="rest-head">
                        <span className="rest-name">{rest.name}</span>
                        <span className="rest-rating">★ {rest.rating}</span>
                      </div>
                      <div className="rest-meta">
                        <span>{rest.cuisine}</span>
                        <span className="dot">•</span>
                        <span className="rest-price">{rest.priceRange}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Tips */}
            {destData?.safetyTips && (
              <div className="info-card safety-card">
                <h3 className="info-title"><ShieldAlert size={18} color="var(--cl-warning)" /> Travel Tips</h3>
                <ul className="safety-list">
                  {destData.safetyTips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Activities Grid ─────────────────────────────── */}
        {city?.activities && city.activities.length > 0 && (
          <section className="destination-section" style={{ marginTop: "var(--sp-2xl)" }}>
            <h2 className="section-title">Activities via Traveloop API</h2>
            <div className="activities-grid">
              {city.activities.map((activity) => (
                <div key={activity.id} className="card activity-card">
                  <div className="activity-thumb">
                    <SmartImage src={activity.imageUrl} fallbackSrc={images.gallery[0] || images.hero} alt={activity.name} />
                  </div>
                  <div className="activity-body">
                    <div className="activity-cat">{activity.category}</div>
                    <h3 className="activity-name">{activity.name}</h3>
                    <div className="activity-price">{usd(activity.estimatedCostUsd)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
