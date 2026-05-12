import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listTrips } from "@/api/trips.api";
import { searchCities } from "@/api/cities.api";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { formatDate, getTripBudget, usd } from "@/lib/format";
import { getTripCardCoverUrl } from "@/lib/tripCover";
import { getCityThumbnail } from "@/lib/cityImages";
import { SmartImage } from "@/components/shared/SmartImage";
import { SkeletonCard, SkeletonRow } from "@/components/shared/Skeleton";
import "@/styles/components/dashboard.css";
import "@/styles/components/ui.css";
import { Calendar, Globe, Hand, Map, MapPin, Plus, Search, Sparkles, User, ArrowRight, Compass } from "lucide-react";
import { startGuidedTour } from "@/components/layout/GuidedTour";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data: tripsData, isLoading: isLoadingTrips } = useQuery({ queryKey: QUERY_KEYS.trips({ limit: 6 }), queryFn: () => listTrips({ limit: 6, sort: "createdAt" }) });
  const { data: citiesData, isLoading: isLoadingCities } = useQuery({ queryKey: QUERY_KEYS.cities("dashboard"), queryFn: () => searchCities({ limit: 8 }), staleTime: 10 * 60 * 1000 });
  const trips = tripsData?.trips ?? [];
  const firstName = user?.name?.split(" ")[0] || "Traveller";

  return (
    <div className="dashboard-root">
      {/* ── Greeting ────────────────────────────────────── */}
      <div className="dashboard-header" style={{ marginBottom: "var(--sp-2xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--sp-lg)" }}>
        <div className="dashboard-greeting" style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "var(--sp-2xl)" }}>
          <div>
            <span className="dashboard-greeting-label" style={{ fontSize: "var(--fs-sm)", color: "var(--cl-accent)", fontWeight: "var(--fw-bold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--sp-xs)", display: "block" }}>Welcome back</span>
            <h1 className="dashboard-greeting-name" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-2xl)", margin: "0 0 var(--sp-xs) 0" }}>Hey, {firstName} <Hand size={24} color="var(--cl-warm)" /></h1>
            <p className="dashboard-greeting-sub" style={{ fontSize: "var(--fs-md)", color: "var(--cl-text-muted)", maxWidth: "400px", margin: 0, lineHeight: "1.4" }}>Plan smarter with recommendations shaped around your trips and travel style.</p>
          </div>

          <div className="dashboard-stats-compact" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xs)", flexShrink: 0 }}>
            <div className="stat-card-compact stat-card-peach" style={{ height: "48px", minWidth: "160px" }}>
              <div className="stat-icon"><Map size={18} /></div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-xs)" }}>
                <span className="stat-value" style={{ fontSize: "var(--fs-lg)" }}>{tripsData?.meta?.total ?? trips.length}</span>
                <span className="stat-label" style={{ fontSize: "var(--fs-2xs)" }}>Trips</span>
              </div>
            </div>
            <div className="stat-card-compact stat-card-warm" style={{ height: "48px", minWidth: "160px" }}>
              <div className="stat-icon"><Globe size={18} /></div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-xs)" }}>
                <span className="stat-value" style={{ fontSize: "var(--fs-lg)" }}>{citiesData?.meta?.total ?? 0}</span>
                <span className="stat-label" style={{ fontSize: "var(--fs-2xs)" }}>Cities</span>
              </div>
            </div>
            <div className="stat-card-compact stat-card-teal" style={{ height: "48px", minWidth: "160px" }}>
              <div className="stat-icon"><Sparkles size={18} /></div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-xs)" }}>
                <span className="stat-value" style={{ fontSize: "var(--fs-lg)", textTransform: "capitalize" }}>{user?.travelerProfile || "solo"}</span>
                <span className="stat-label" style={{ fontSize: "var(--fs-2xs)" }}>Style</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
          <button type="button" className="btn btn-secondary" onClick={startGuidedTour}>Take Tour</button>
          <Link to={ROUTES.tripNew} className="btn btn-primary"><span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Plus size={16} /> Plan New Trip</span></Link>
        </div>
      </div>

      {/* Header and Stats are now combined */}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3xl)" }}>
        {/* Quick Search */}
        <div className="dashboard-search" style={{ display: "flex", alignItems: "center", background: "var(--cl-bg)", borderRadius: "var(--br-full)", padding: "var(--sp-sm) var(--sp-xl)", border: "1px solid var(--cl-border)", margin: "0 0 var(--sp-xl)", width: "100%", transition: "border-color 0.2s ease" }}>
          <span className="dashboard-search-icon" style={{ display: "flex", color: "var(--cl-text-muted)", opacity: 0.7 }}><Search size={18} /></span>
          <input 
            placeholder="Search destinations, trips, or activities" 
            style={{ flex: 1, border: "none", background: "transparent", padding: "var(--sp-xs) var(--sp-md)", fontSize: "var(--fs-sm)", outline: "none", color: "var(--cl-text)" }}
            onFocus={() => navigate(ROUTES.search)} 
          />
          <span onClick={() => navigate(ROUTES.search)} style={{ color: "var(--cl-accent)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", cursor: "pointer", paddingLeft: "var(--sp-md)" }}>Search</span>
        </div>

        {/* ── Cards Section ─────────────────────────────── */}
        {/* ── Top Cards Section ──────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--sp-lg)", alignItems: "stretch" }}>
          {/* AI Powered Planning Card (Former Hero) */}
          <div className="dashboard-hero-banner" style={{ background: "linear-gradient(135deg, var(--cl-accent) 0%, #D86B50 100%)", borderRadius: "var(--br-2xl)", padding: "var(--sp-xl)", color: "white", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
            <div className="dashboard-banner-content" style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
              <div className="dashboard-banner-label" style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "var(--br-full)", fontSize: "var(--fs-2xs)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-sm)", alignSelf: "flex-start" }}>
                <Sparkles size={12} /> AI PLANNING
              </div>
              <h2 className="dashboard-banner-title" style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-xs)", fontWeight: "var(--fw-bold)" }}>Build your next India itinerary</h2>
              <p className="dashboard-banner-sub" style={{ fontSize: "var(--fs-xs)", opacity: 0.9, marginBottom: "var(--sp-lg)", lineHeight: 1.4, flex: 1 }}>
                Create a trip and let AI estimate budgets and suggest packing lists perfectly tailored to you.
              </p>
              <Link to={ROUTES.tripNew} className="btn btn-sm" style={{ background: "white", color: "var(--cl-accent)", display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)", alignSelf: "flex-start", marginTop: "auto" }}>
                Start <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="quick-action-card card" style={{ padding: "var(--sp-xl)", background: "var(--cl-surface)", display: "flex", flexDirection: "column", height: "100%", border: "1px solid var(--cl-border)", color: "var(--cl-text-on-surface)" }}>
            <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-lg)", fontWeight: "var(--fw-bold)", color: "inherit" }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-sm)", flex: 1 }}>
              {[
                { icon: Plus, label: "New Trip", to: ROUTES.tripNew }, 
                { icon: Compass, label: "Explore", to: ROUTES.search }, 
                { icon: Globe, label: "Community", to: ROUTES.community },
                { icon: User, label: "Profile", to: ROUTES.profile }
              ].map((a) => (
                <Link key={a.label} to={a.to} className="card-hover" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "var(--sp-sm)", padding: "var(--sp-md)", borderRadius: "var(--br-xl)", textDecoration: "none", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.2s ease" }}>
                  <div style={{ color: "var(--cl-accent)", background: "var(--cl-bg)", padding: "var(--sp-sm)", borderRadius: "50%", boxShadow: "var(--shadow-sm)" }}><a.icon size={22} /></div>
                  <div style={{ fontWeight: "var(--fw-bold)", color: "var(--cl-text-on-surface)", fontSize: "var(--fs-sm)" }}>{a.label}</div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Unlock AI Features Card */}
          <div className="card" style={{ padding: "var(--sp-xl)", background: "var(--cl-surface)", display: "flex", flexDirection: "column", height: "100%", border: "1px solid var(--cl-border)" }}>
            <div style={{ display: "flex", gap: "var(--sp-md)", marginBottom: "var(--sp-lg)" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "var(--br-lg)", background: "var(--cl-teal)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "var(--shadow-teal)" }}><Sparkles size={28} /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)" }}>Traveloop Pro</h3>
                <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--cl-text-muted)" }}>Unlock AI Features</p>
              </div>
            </div>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--cl-text-muted)", marginBottom: "var(--sp-xl)", flex: 1, lineHeight: "1.6" }}>Add a Gemini API key in your profile to enable smart budget estimates and packing suggestions perfectly tailored to you.</p>
            <Link to={ROUTES.profile} className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", padding: "var(--sp-md)" }}>Configure Profile</Link>
          </div>
        </div>

        {/* ── Recent Trips Section (Full Width) ──────────────── */}
        <section style={{ display: "flex", flexDirection: "column" }}>
          <div className="dashboard-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-lg)" }}>
            <h2 style={{ fontSize: "var(--fs-xl)", margin: 0 }}>Recent Trips</h2>
            <Link to={ROUTES.trips} style={{ fontSize: "var(--fs-sm)", color: "var(--cl-accent)", fontWeight: "var(--fw-bold)", display: "flex", alignItems: "center", gap: "4px" }}>View all <ArrowRight size={14} /></Link>
          </div>
          
          <div style={{ width: "100%" }}>
            {isLoadingTrips ? (
              <div className="trip-cards-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--sp-lg)" }}>
                {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} imageHeight="12rem" />)}
              </div>
            ) : trips.length > 0 ? (
              <div className="trip-cards-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--sp-lg)" }}>
                {trips.slice(0, 3).map((trip) => (
                  <Link key={trip.id} to={ROUTES.tripDetail(trip.id)} className="card card-hover trip-mini-card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--cl-border)", display: "flex", flexDirection: "column" }}>
                    <div className="trip-mini-thumb" style={{ height: "12rem", width: "100%", margin: 0, borderRadius: 0 }}>
                      <SmartImage src={trip.coverPhotoUrl} fallbackSrc={getTripCardCoverUrl(trip)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="trip-mini-body" style={{ padding: "var(--sp-md)", background: "var(--cl-surface)", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div className="trip-mini-name" style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-sm)" }}>{trip.title}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xs)", color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)", marginTop: "auto" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={14} /> {trip.tripType}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", padding: "var(--sp-3xl) var(--sp-xl)", border: "1px solid var(--cl-border)", textAlign: "center" }}>
                <Map size={48} color="var(--cl-text-muted)" style={{ marginBottom: "var(--sp-md)" }} />
                <h3 style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-xs)" }}>No trips yet</h3>
                <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-lg)" }}>Create your first itinerary and start exploring.</p>
                <Link to={ROUTES.tripNew} className="btn btn-primary">Plan a Trip</Link>
              </div>
            )}
          </div>
        </section>

          {/* Explore Destinations Section */}
          <section>
            <div className="dashboard-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-lg)" }}>
              <h2 style={{ fontSize: "var(--fs-xl)", margin: 0 }}>Explore Destinations</h2>
              <Link to={ROUTES.cities} style={{ fontSize: "var(--fs-sm)", color: "var(--cl-accent)", fontWeight: "var(--fw-bold)", display: "flex", alignItems: "center", gap: "4px" }}>Explore <ArrowRight size={14} /></Link>
            </div>
            
            {isLoadingCities ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-sm)" }}>
                {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : (
              <div className="dest-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--sp-lg)" }}>
                {(citiesData?.cities ?? []).slice(0, 6).map((city) => (
                  <Link key={city.id} to={ROUTES.cityDetail(city.id)} className="card card-hover dest-tile" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--cl-border)", borderRadius: "var(--br-2xl)", transition: "transform 0.3s ease" }}>
                    <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden" }}>
                      <SmartImage src={city.thumbnailUrl} fallbackSrc={getCityThumbnail(city)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="dest-tile-name" style={{ padding: "var(--sp-md)", fontWeight: "var(--fw-bold)", fontSize: "var(--fs-sm)", textAlign: "center", background: "var(--cl-surface)", color: "var(--cl-accent)", opacity: 1, display: "block" }}>{city.name}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
    </div>
  );
}
