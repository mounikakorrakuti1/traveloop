import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCityById } from "@/api/cities.api";
import { getDestinationIntelligence, searchTransportOptions } from "@/api/destinations.api";
import { listPlaceChatMessages, sendPlaceChatMessage } from "@/api/community.api";
import { SmartImage } from "@/components/shared/SmartImage";
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/shared/Skeleton";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { getCityImages } from "@/lib/cityImages";
import { getDestinationData } from "@/lib/destinationData";
import { buildFallbackTransportRoutes } from "@/lib/transportFallback";
import { usd } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { Bus, MapPin, Plane, Thermometer, Info, ShieldAlert, Navigation, Star, Palmtree, Train, Utensils, IndianRupee, MessageCircle, Send } from "lucide-react";
import "@/styles/components/ui.css";
import "@/styles/components/destination.css";

function budgetFromCostIndex(costIndex) {
  if (costIndex === "high") return "₹15,000/day";
  if (costIndex === "low") return "₹3,500/day";
  return "₹6,000/day";
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getRouteOrigin(cityName) {
  return ["Delhi", "Mumbai", "Bengaluru"].includes(cityName) ? "Hyderabad" : "Delhi";
}

function normalizeTransportRoute(route) {
  return {
    id: route.id,
    mode: route.mode,
    provider: route.operator || route.provider || "Traveloop Transport",
    from: route.origin || route.fromCity || route.from,
    to: route.destination || route.toCity || route.to,
    departureTime: route.departureTime,
    arrivalTime: route.arrivalTime,
    duration: route.duration,
    price: Number(route.estimatedPriceInr ?? route.price ?? 0),
    type: route.mode === "flight" ? "Flight" : route.mode === "train" ? "Train" : "Bus",
    routeSummary: route.routeSummary,
    isSampleData: route.isSampleData,
  };
}

const transportIcons = {
  flight: Plane,
  train: Train,
  bus: Bus,
};

export default function CityDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [transportMode, setTransportMode] = useState("all");
  const [chatDraft, setChatDraft] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);

  const cityQuery = useQuery({
    queryKey: QUERY_KEYS.cityDetail(id),
    queryFn: () => getCityById(id),
    enabled: Boolean(id)
  });

  const city = cityQuery.data;
  const cityName = city?.name || "Destination";
  
  const intelligenceQuery = useQuery({
    queryKey: QUERY_KEYS.cityIntelligence(id),
    queryFn: () => getDestinationIntelligence(id),
    enabled: Boolean(id),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
  const intelligence = intelligenceQuery.data;

  // Local destination data remains a fallback when live aggregation is unavailable.
  const destData = useMemo(() => getDestinationData(cityName), [cityName]);
  const images = useMemo(() => getCityImages(cityName), [cityName]);
  const heroImage = intelligence?.heroImage || city?.thumbnailUrl || images.hero;
  const famousPlaces = useMemo(() => {
    if (intelligence?.famousPlaces?.length) {
      return intelligence.famousPlaces.map((name) => ({ name, description: `Plan this around your ${cityName} route to reduce backtracking.` }));
    }
    return destData?.famousPlaces || [];
  }, [cityName, destData?.famousPlaces, intelligence?.famousPlaces]);
  const topAttractions = intelligence?.famousPlaces?.length ? intelligence.famousPlaces : destData?.topAttractions;
  const hiddenGems = intelligence?.hiddenGems?.length ? intelligence.hiddenGems : destData?.hiddenGems;
  const restaurants = intelligence?.restaurants?.length
    ? intelligence.restaurants.map((name) => ({ name, cuisine: "Local recommendation", rating: "AI", priceRange: "INR" }))
    : destData?.restaurants;
  const safetyTips = intelligence?.safetyTips?.length ? intelligence.safetyTips : destData?.safetyTips;
  const liveWeather = intelligence?.weather;
  const budgetEstimate = intelligence?.estimatedBudgetInr;
  const placeChatParams = useMemo(() => {
    if (!city?.name) return null;
    return { cityId: city.id, destinationName: city.name, limit: 30 };
  }, [city?.id, city?.name]);
  const placeChatKey = ["community", "place-chat", placeChatParams];
  const placeChatQuery = useQuery({
    queryKey: placeChatKey,
    queryFn: () => listPlaceChatMessages(placeChatParams),
    enabled: Boolean(placeChatParams),
    staleTime: 15 * 1000,
    refetchInterval: 20000,
  });
  const sendChatMutation = useMutation({
    mutationFn: () => sendPlaceChatMessage({
      cityId: city.id,
      destinationName: city.name,
      body: chatDraft.trim(),
    }),
    onSuccess: (message) => {
      queryClient.setQueryData(placeChatKey, (current = []) => [...current, message]);
      setChatDraft("");
    },
  });

  const transportParams = useMemo(() => {
    if (!city?.name) return null;
    return {
      origin: getRouteOrigin(city.name),
      destination: city.name,
      departureDate: todayIso(),
      mode: transportMode,
    };
  }, [city?.name, transportMode]);

  const transportQuery = useQuery({
    queryKey: QUERY_KEYS.transportSearch(transportParams),
    queryFn: () => searchTransportOptions(transportParams),
    enabled: Boolean(transportParams),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const transportRoutes = useMemo(() => {
    if (!transportParams) return [];
    const routes = transportQuery.data?.options?.length
      ? transportQuery.data.options
      : buildFallbackTransportRoutes(transportParams);
    return routes.map(normalizeTransportRoute);
  }, [transportParams, transportQuery.data?.options]);

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
          <p className="destination-tagline">{intelligence?.normalized?.aiSummary || destData?.tagline || [city?.state, city?.country].filter(Boolean).join(", ")}</p>
        </div>
      </div>

      <div className="destination-container">
        {/* ── Main Content Area ───────────────────────────── */}
        <div className="destination-grid">
          <div className="destination-main">
            
            {/* Description */}
            <section className="destination-section">
              <h2 className="section-title">About {cityName}</h2>
              <p className="destination-description">{intelligence?.normalized?.description || destData?.description || "A beautiful destination waiting to be explored. Traveloop AI is currently gathering more insights about this location."}</p>
            </section>

            {/* Famous Places */}
            {famousPlaces.length > 0 && (
              <section className="destination-section">
                <h2 className="section-title"><Palmtree size={20} className="section-icon" /> Must-Visit Places</h2>
                <div className="places-grid">
                  {famousPlaces.map((place, i) => (
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
              {topAttractions?.length > 0 && (
                <div className="highlight-card">
                  <h3>Top Activities</h3>
                  <ul className="highlight-list">
                    {topAttractions.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
              {hiddenGems?.length > 0 && (
                <div className="highlight-card accent">
                  <h3>Local Hidden Gems</h3>
                  <ul className="highlight-list">
                    {hiddenGems.map((item, i) => <li key={i}>{item}</li>)}
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
                        <div className="provider-logo provider-logo-icon">
                          {(() => {
                            const Icon = transportIcons[route.mode] || Navigation;
                            return <Icon size={22} />;
                          })()}
                        </div>
                        <div className="provider-details">
                          <span className="provider-name">{route.provider}</span>
                          <span className="provider-type">{route.type}{route.isSampleData ? " · indicative" : ""}</span>
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
                        <span className="price">INR {route.price.toLocaleString("en-IN")}</span>
                        <button className="btn btn-primary btn-sm">Book</button>
                      </div>
                      {route.routeSummary && <div className="transport-route-note">{route.routeSummary}</div>}
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
                  <div className="fact-value">{intelligence?.bestTimeToVisit || destData?.bestTimeToVisit || city?.bestSeason || "October to March"}</div>
                </div>
              </div>
              
              <div className="fact-item">
                <IndianRupee className="fact-icon" size={18} />
                <div>
                  <div className="fact-label">Est. Daily Budget</div>
                  <div className="fact-value">{budgetEstimate?.comfort ? usd(budgetEstimate.comfort) : destData?.estimatedBudget?.mid || budgetFromCostIndex(city?.costIndex)}</div>
                </div>
              </div>

              {(liveWeather || destData?.weather) && (
                <div className="weather-mini">
                  <div className="weather-item">
                    <span>☀️ Summer</span>
                    <span>{liveWeather?.summary || destData?.weather?.summer}</span>
                  </div>
                  <div className="weather-item">
                    <span>❄️ Winter</span>
                    <span>{liveWeather?.avgTempC ? `${liveWeather.avgTempC} C` : destData?.weather?.winter}</span>
                  </div>
                </div>
              )}
            </div>

            <div className={`info-card place-chat-card${isChatOpen ? " open" : ""}`}>
              <button className="place-chat-toggle" type="button" onClick={() => setIsChatOpen((open) => !open)}>
                <span><MessageCircle size={18} /> {cityName} Traveler Chat</span>
                <span className="place-chat-count">{user ? `${(placeChatQuery.data || []).length || 3} chats` : "Login"}</span>
              </button>
              {isChatOpen && (
                <div className="place-chat-dropdown">
                  <p className="place-chat-note">Chat with travelers interested in this place. Traveloop shows generated aliases only.</p>
                  {!user ? (
                    <Link to={ROUTES.login} className="btn btn-secondary btn-sm">Log in to chat</Link>
                  ) : (
                    <>
                      <div className="place-chat-messages">
                        {placeChatQuery.isLoading && <div className="place-chat-empty">Loading messages...</div>}
                        {(placeChatQuery.data || []).map((message) => (
                          <div key={message.id} className={`place-chat-message${message.isOwn ? " own" : ""}${message.isSystem ? " starter" : ""}`}>
                            <div className="place-chat-meta">
                              <span>{message.authorAlias}</span>
                              <time>{new Date(message.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</time>
                            </div>
                            <p>{message.body}</p>
                          </div>
                        ))}
                      </div>
                      <form
                        className="place-chat-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (!chatDraft.trim() || sendChatMutation.isPending || !city?.id) return;
                          sendChatMutation.mutate();
                        }}
                      >
                        <input
                          value={chatDraft}
                          onChange={(event) => setChatDraft(event.target.value)}
                          maxLength={800}
                          placeholder={`Message travelers in ${cityName}`}
                        />
                        <button className="btn btn-primary btn-icon" disabled={!chatDraft.trim() || sendChatMutation.isPending} title="Send message">
                          <Send size={16} />
                        </button>
                      </form>
                      {sendChatMutation.isError && <div className="place-chat-error">Unable to send message. Please try again.</div>}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Restaurants */}
            {restaurants?.length > 0 && (
              <div className="info-card">
                <h3 className="info-title"><Utensils size={18} /> Top Restaurants</h3>
                <div className="restaurant-list">
                  {restaurants.map((rest, i) => (
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
            {safetyTips?.length > 0 && (
              <div className="info-card safety-card">
                <h3 className="info-title"><ShieldAlert size={18} color="var(--cl-warning)" /> Travel Tips</h3>
                <ul className="safety-list">
                  {safetyTips.map((tip, i) => <li key={i}>{tip}</li>)}
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
