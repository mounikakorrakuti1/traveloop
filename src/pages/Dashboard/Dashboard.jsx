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
    <div className="dashboard-root" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "var(--sp-4xl)" }}>
      {/* ── Greeting ────────────────────────────────────── */}
      <div className="dashboard-header" style={{ marginBottom: "var(--sp-2xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--sp-lg)" }}>
        <div className="dashboard-greeting">
          <span className="dashboard-greeting-label" style={{ fontSize: "var(--fs-sm)", color: "var(--cl-accent)", fontWeight: "var(--fw-bold)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--sp-xs)", display: "block" }}>Welcome back</span>
          <h1 className="dashboard-greeting-name" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-3xl)", margin: "0 0 var(--sp-xs) 0" }}>Hey, {firstName} <Hand size={28} color="var(--cl-warm)" /></h1>
          <p className="dashboard-greeting-sub" style={{ fontSize: "var(--fs-lg)", color: "var(--cl-text-muted)", maxWidth: "500px", margin: 0 }}>Plan smarter with recommendations shaped around your trips, travel style, and saved destinations.</p>
        </div>
        <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
          <button type="button" className="btn btn-secondary" onClick={startGuidedTour}>Take Tour</button>
          <Link to={ROUTES.tripNew} className="btn btn-primary"><span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Plus size={16} /> Plan New Trip</span></Link>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────── */}
      <div className="dashboard-stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--sp-md)", marginBottom: "var(--sp-2xl)" }}>
        <div className="stat-card stat-card-peach" style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", padding: "var(--sp-lg)", borderRadius: "var(--br-2xl)" }}>
          <div className="stat-icon" style={{ background: "rgba(255,255,255,0.4)", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Map size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>{tripsData?.meta?.total ?? trips.length}</div><div className="stat-label">Trips Planned</div></div>
        </div>
        <div className="stat-card stat-card-warm" style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", padding: "var(--sp-lg)", borderRadius: "var(--br-2xl)" }}>
          <div className="stat-icon" style={{ background: "rgba(255,255,255,0.4)", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Globe size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)" }}>{citiesData?.meta?.total ?? 0}</div><div className="stat-label">Destinations</div></div>
        </div>
        <div className="stat-card stat-card-teal" style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", padding: "var(--sp-lg)", borderRadius: "var(--br-2xl)" }}>
          <div className="stat-icon" style={{ background: "rgba(255,255,255,0.4)", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={24} /></div>
          <div><div className="stat-value" style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)", textTransform: "capitalize" }}>{user?.travelerProfile || "solo"}</div><div className="stat-label">Travel Style</div></div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "var(--sp-3xl)", alignItems: "start" }}>
        {/* ── Main Content Column ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3xl)" }}>
          
          {/* Quick Search */}
          <div className="dashboard-search" style={{ display: "flex", alignItems: "center", background: "var(--cl-surface)", borderRadius: "var(--br-full)", padding: "4px 4px 4px var(--sp-md)", border: "1px solid var(--cl-border)", boxShadow: "var(--shadow-sm)" }}>
            <span className="dashboard-search-icon" style={{ display: "flex", color: "var(--cl-text-subtle)" }}><Search size={20} /></span>
            <input 
              placeholder="Where to next? (e.g. Kashmir, Weekend, Solo)" 
              style={{ flex: 1, border: "none", background: "transparent", padding: "var(--sp-sm) var(--sp-sm)", fontSize: "var(--fs-md)" }}
              onFocus={() => navigate(ROUTES.search)} 
            />
            <button className="btn btn-primary" onClick={() => navigate(ROUTES.search)} style={{ borderRadius: "var(--br-full)", padding: "var(--sp-xs) var(--sp-lg)" }}>Search</button>
          </div>

          {/* Hero Banner */}
          <div className="dashboard-hero-banner" style={{ background: "linear-gradient(135deg, var(--cl-accent) 0%, #D86B50 100%)", borderRadius: "var(--br-2xl)", padding: "var(--sp-2xl)", color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
            <div className="dashboard-banner-content" style={{ position: "relative", zIndex: 1 }}>
              <div className="dashboard-banner-label" style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "var(--br-full)", fontSize: "var(--fs-xs)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-md)" }}>
                <Sparkles size={14} /> AI-Powered Planning
              </div>
              <h2 className="dashboard-banner-title" style={{ fontSize: "var(--fs-3xl)", marginBottom: "var(--sp-sm)" }}>Build your next India itinerary</h2>
              <p className="dashboard-banner-sub" style={{ fontSize: "var(--fs-lg)", opacity: 0.9, maxWidth: "500px", marginBottom: "var(--sp-xl)", lineHeight: 1.5 }}>
                Create a trip, add stops, then let AI estimate budgets in rupees and suggest packing lists perfectly tailored to your travel style.
              </p>
              <Link to={ROUTES.tripNew} className="btn" style={{ background: "white", color: "var(--cl-accent)", display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                Start Planning <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Recent Trips Section */}
          <section>
            <div className="dashboard-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--sp-lg)" }}>
              <h2 style={{ fontSize: "var(--fs-xl)", margin: 0 }}>Recent Trips</h2>
              <Link to={ROUTES.trips} style={{ fontSize: "var(--fs-sm)", color: "var(--cl-accent)", fontWeight: "var(--fw-bold)", display: "flex", alignItems: "center", gap: "4px" }}>View all <ArrowRight size={14} /></Link>
            </div>
            
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
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={14} /> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</div>
                        {getTripBudget(trip) > 0 && <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-text)", fontWeight: "var(--fw-bold)", marginTop: "4px" }}>{usd(getTripBudget(trip))} total budget</div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", padding: "var(--sp-3xl) var(--sp-xl)" }}>
                <Map size={48} color="var(--cl-text-muted)" style={{ marginBottom: "var(--sp-md)" }} />
                <h3 style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-xs)" }}>No trips yet</h3>
                <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-lg)" }}>Create your first itinerary and start exploring.</p>
                <Link to={ROUTES.tripNew} className="btn btn-primary">Plan a Trip</Link>
              </div>
            )}
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
              <div className="dest-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--sp-md)" }}>
                {(citiesData?.cities ?? []).slice(0, 6).map((city) => (
                  <Link key={city.id} to={ROUTES.cityDetail(city.id)} className="card card-hover dest-pill" style={{ padding: 0, overflow: "hidden", display: "flex", border: "1px solid var(--cl-border)", height: "80px", alignItems: "center" }}>
                    <div style={{ width: "80px", height: "100%", flexShrink: 0 }}>
                      <SmartImage src={city.thumbnailUrl} fallbackSrc={getCityThumbnail(city)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="dest-pill-name" style={{ padding: "0 var(--sp-md)", fontWeight: "var(--fw-semibold)", fontSize: "var(--fs-sm)" }}>{city.name}</div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Sidebar Column ──────────────────────────────── */}
        <div className="quick-actions-panel" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xl)", position: "sticky", top: "var(--sp-2xl)" }}>
          <div className="quick-action-card card" style={{ padding: "var(--sp-xl)" }}>
            <h3 style={{ fontSize: "var(--fs-lg)", marginBottom: "var(--sp-lg)" }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-xs)" }}>
              {[
                { icon: Plus, label: "New Trip", to: ROUTES.tripNew, desc: "Create an itinerary" }, 
                { icon: Compass, label: "Explore", to: ROUTES.search, desc: "Find destinations" }, 
                { icon: Globe, label: "Community", to: ROUTES.community, desc: "Read travel stories" },
                { icon: User, label: "My Profile", to: ROUTES.profile, desc: "Update your travel style" }
              ].map((a) => (
                <Link key={a.label} to={a.to} className="card-hover" style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)", padding: "var(--sp-md)", borderRadius: "var(--br-lg)", textDecoration: "none", background: "var(--cl-bg-subtle)", border: "1px solid transparent" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--cl-surface)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--cl-accent)", boxShadow: "var(--shadow-sm)" }}><a.icon size={20} /></div>
                  <div>
                    <div style={{ fontWeight: "var(--fw-bold)", color: "var(--cl-text)", fontSize: "var(--fs-sm)" }}>{a.label}</div>
                    <div style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-xs)" }}>{a.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="card" style={{ padding: "var(--sp-xl)", background: "var(--cl-surface)" }}>
            <div style={{ display: "flex", gap: "var(--sp-sm)", marginBottom: "var(--sp-md)" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--cl-teal)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={24} /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--fs-md)" }}>Traveloop Pro</h3>
                <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)" }}>Unlock AI Features</p>
              </div>
            </div>
            <p style={{ fontSize: "var(--fs-sm)", color: "var(--cl-text-muted)", marginBottom: "var(--sp-md)" }}>Add a Gemini API key in your profile to enable smart budget estimates and packing suggestions.</p>
            <Link to={ROUTES.profile} className="btn btn-secondary btn-sm" style={{ width: "100%" }}>Go to Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
