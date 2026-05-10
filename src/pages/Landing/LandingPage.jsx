import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Map, Banknote, Luggage, StickyNote, Globe, Sparkles, Plane, Calendar, Briefcase, Rocket, Umbrella, Castle, Mountain, Building2, Trees, Sun, Moon, Star, MapPin, Heart } from "lucide-react";
import "@/styles/components/landing.css";

const features = [
  { icon: Map,        variant: "feature-icon-peach", title: "Smart Itinerary Builder", desc: "Plan day-by-day itineraries with stops, activities, and time blocks. Reorder with drag-and-drop ease." },
  { icon: Banknote,   variant: "feature-icon-warm",  title: "Budget Tracker",        desc: "Track every expense, generate invoice-style breakdowns, and get AI-powered budget estimates." },
  { icon: Luggage,    variant: "feature-icon-teal",  title: "Packing Checklist",     desc: "Never forget essentials. Get AI-suggested packing lists tailored to your destination and travel style." },
  { icon: StickyNote, variant: "feature-icon-peach", title: "Trip Notes",            desc: "Capture memories, tips, and bookings. Organise notes by stop, date, or tag." },
  { icon: Globe,      variant: "feature-icon-teal",  title: "Community Feed",        desc: "Share your trips, discover hidden gems, and connect with fellow travellers from around the globe." },
  { icon: Sparkles,   variant: "feature-icon-warm",  title: "AI Suggestions",        desc: "Get personalised destination recommendations and activity ideas powered by AI." },
];

const steps = [
  { num: "01", icon: Plane,     title: "Create your trip",        desc: "Set your destination, dates, and budget in seconds." },
  { num: "02", icon: Calendar,  title: "Build your itinerary",    desc: "Add stops, activities, and notes day by day." },
  { num: "03", icon: Briefcase, title: "Pack & budget",           desc: "AI-generated packing lists and live expense tracking." },
  { num: "04", icon: Rocket,    title: "Travel & share",          desc: "Share your public trip and inspire the community." },
];

const testimonials = [
  { stars: "★★★★★", text: "Travel-Loop completely changed how I plan trips. The itinerary builder is intuitive and the AI suggestions are spot-on.", name: "Priya Sharma", role: "Solo Traveller" },
  { stars: "★★★★★", text: "Finally a travel app that tracks budgets properly! I saved ₹12,000 on my last Rajasthan trip thanks to the insights.", name: "Arjun Mehta", role: "Budget Explorer" },
  { stars: "★★★★☆", text: "The community feature is amazing. I discovered Coorg through a shared trip and it was the best weekend of my year.", name: "Divya Reddy", role: "Weekend Wanderer" },
];

const destinations = [
  { name: "Goa",      icon: Umbrella, trips: "2.4k trips", big: true },
  { name: "Jaipur",   icon: Castle, trips: "1.8k trips" },
  { name: "Manali",   icon: Mountain, trips: "1.2k trips" },
  { name: "Mysuru",   icon: Castle, trips: "900 trips"  },
  { name: "Kerala",   icon: Trees, trips: "1.5k trips" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ background: "var(--cl-bg)" }}>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="landing-hero">
        {/* Navbar */}
        <div className="landing-navbar">
          <Link to={ROUTES.landing} className="landing-nav-logo">
            <div className="landing-logo-mark">TL</div>
            <span className="landing-logo-text">Travel-Loop</span>
          </Link>

          <div className="landing-nav-links">
            <a href="#features"      className="landing-nav-link">Features</a>
            <a href="#how-it-works"  className="landing-nav-link">How it works</a>
            <a href="#destinations"  className="landing-nav-link">Destinations</a>
          </div>

          <div className="landing-nav-actions">
            <button
              onClick={toggleTheme}
              style={{
                background: "rgba(244,241,222,0.08)",
                border: "1px solid rgba(244,241,222,0.15)",
                borderRadius: "var(--br-md)",
                width: "2.25rem",
                height: "2.25rem",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                fontSize: "1rem",
              }}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to={ROUTES.login}  className="btn btn-ghost btn-sm" style={{ color: "rgba(244,241,222,0.75)" }}>
              Sign In
            </Link>
            <Link to={ROUTES.signup} className="btn btn-primary btn-sm">
              Get Started →
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="landing-hero-body">
          <div className="landing-hero-text">
            <div className="landing-hero-eyebrow">
              <span style={{ display: "inline-flex" }}><Star size={18} fill="var(--cl-warm)" color="var(--cl-warm)" /></span> The smarter way to travel India
            </div>

            <h1 className="landing-hero-title">
              Plan Every{" "}
              <span className="landing-hero-title-accent">Adventure</span>
              <br />
              Like a Pro
            </h1>

            <p className="landing-hero-desc">
              Build stunning itineraries, track your budget, manage packing lists,
              and share your journeys — all in one beautifully crafted travel companion.
            </p>

            <div className="landing-hero-cta">
              <Link to={ROUTES.signup} className="btn btn-primary btn-lg">
                Start Planning Free →
              </Link>
              <Link to={ROUTES.login} className="btn btn-secondary btn-lg" style={{ borderColor: "rgba(244,241,222,0.25)", color: "rgba(244,241,222,0.8)" }}>
                Sign In
              </Link>
            </div>

            <div className="hero-stat-row">
              {[
                { value: "10k+",   label: "Trips Planned" },
                { value: "4.9 ★",  label: "User Rating" },
                { value: "50+",    label: "Destinations" },
              ].map((s) => (
                <div key={s.label} className="hero-stat">
                  <div className="hero-stat-value">{s.value}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating cards visual */}
          <div className="landing-hero-visual">
            <div className="hero-dots hero-dots-tl" />
            <div className="hero-dots hero-dots-br" />

            {/* Main card */}
            <div className="hero-card hero-card-main">
              <div className="hero-card-label" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={14} /> Current Trip</div>
              <div className="hero-card-title">Goa Beach Escape</div>
              <div className="hero-card-sub">5 Days · 3 Stops · ₹28,000</div>
              <div className="hero-card-tag">🟢 Active</div>
            </div>

            {/* Trip card */}
            <div className="hero-card hero-card-trip">
              <div className="hero-card-label" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Map size={14} /> Next Stop</div>
              <div className="hero-card-title">Panjim Old Town</div>
              <div className="hero-card-sub">Day 2 · 3 Activities</div>
            </div>

            {/* Budget card */}
            <div className="hero-card hero-card-budget">
              <div className="hero-card-label" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Banknote size={14} /> Budget</div>
              <div className="hero-card-amount">₹28,000</div>
              <div className="hero-card-sub" style={{ marginTop: "4px" }}>₹11,200 spent · 60% left</div>
              <div style={{ height: "4px", background: "rgba(244,241,222,0.1)", borderRadius: "99px", marginTop: "10px" }}>
                <div style={{ width: "40%", height: "100%", background: "var(--cl-teal)", borderRadius: "99px" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" style={{ padding: "var(--sp-3xl) var(--sp-xl)", background: "var(--cl-bg)" }}>
        <div style={{ maxWidth: "var(--max-w-2xl)", margin: "0 auto" }}>
          <div className="landing-section-header">
            <div className="landing-section-label">Everything you need</div>
            <h2 className="landing-section-title">
              Your complete travel planning toolkit
            </h2>
            <p className="landing-section-desc">
              From first idea to final memory — Travel-Loop covers every step of your journey.
            </p>
          </div>

          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className={`feature-icon ${f.variant}`}><f.icon size={28} /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "0 var(--sp-xl) var(--sp-3xl)" }}>
        <div style={{ maxWidth: "var(--max-w-2xl)", margin: "0 auto" }}>
          <div className="how-section">
            <div className="landing-section-header" style={{ marginBottom: "var(--sp-xl)" }}>
              <div className="landing-section-label" style={{ color: "var(--cl-warm)" }}>Simple process</div>
              <h2 className="landing-section-title" style={{ color: "var(--cl-text-on-surface)" }}>
                Start your trip in 4 easy steps
              </h2>
            </div>

            <div className="how-steps">
              {steps.map((s) => (
                <div key={s.num} className="how-step">
                  <div className="how-step-num">{s.num}</div>
                  <div className="how-step-icon"><s.icon size={32} /></div>
                  <div>
                    <div className="how-step-title">{s.title}</div>
                    <div className="how-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Destinations ──────────────────────────────────── */}
      <section id="destinations" style={{ padding: "0 var(--sp-xl) var(--sp-3xl)" }}>
        <div style={{ maxWidth: "var(--max-w-2xl)", margin: "0 auto" }}>
          <div className="landing-section-header">
            <div className="landing-section-label">Trending now</div>
            <h2 className="landing-section-title">Popular destinations</h2>
          </div>

          <div className="destinations-grid">
            {destinations.map((d) => (
              <div key={d.name} className={`dest-card${d.big ? " dest-card-big" : ""}`}>
                <div
                  className="dest-card-bg"
                  style={{
                    background: d.big
                      ? "linear-gradient(135deg, #3D405B 0%, #4A4D6B 100%)"
                      : "linear-gradient(135deg, #2A2D47 0%, #3D405B 100%)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: d.big ? "5rem" : "3.5rem",
                  }}
                >
                  <d.icon size={d.big ? 64 : 48} color="rgba(255,255,255,0.2)" />
                </div>
                <div className="dest-card-overlay" />
                <div className="dest-card-content">
                  <div className="dest-card-name">{d.name}</div>
                  <div className="dest-card-trips">{d.trips}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section style={{ padding: "0 var(--sp-xl) var(--sp-3xl)", background: "var(--cl-bg-alt)" }}>
        <div style={{ maxWidth: "var(--max-w-2xl)", margin: "0 auto", paddingTop: "var(--sp-3xl)" }}>
          <div className="landing-section-header">
            <div className="landing-section-label">Social proof</div>
            <h2 className="landing-section-title">What travellers say</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">{t.stars}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="avatar avatar-sm">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-author-name">{t.name}</div>
                    <div className="testimonial-author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section style={{ padding: "var(--sp-3xl) var(--sp-xl)" }}>
        <div style={{ maxWidth: "var(--max-w-2xl)", margin: "0 auto" }}>
          <div className="cta-section">
            <h2 className="cta-title">
              Ready to plan your next adventure?
            </h2>
            <p className="cta-desc">
              Join thousands of travellers who plan smarter with Travel-Loop.
              Free forever for personal use.
            </p>
            <div className="cta-actions">
              <Link
                to={ROUTES.signup}
                className="btn btn-lg"
                style={{
                  background: "#fff",
                  color: "var(--cl-accent)",
                  fontWeight: "var(--fw-bold)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                Create Free Account →
              </Link>
              <Link
                to={ROUTES.login}
                className="btn btn-lg"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div>
            <Link to={ROUTES.landing} className="landing-nav-logo" style={{ marginBottom: "var(--sp-md)", textDecoration: "none" }}>
              <div className="landing-logo-mark">TL</div>
              <span className="landing-logo-text">Travel-Loop</span>
            </Link>
            <p className="footer-brand-desc">
              The all-in-one travel planning platform for modern explorers. Plan, track, and share your adventures.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Product</div>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><Link to={ROUTES.login}>Sign In</Link></li>
              <li><Link to={ROUTES.signup}>Get Started</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Explore</div>
            <ul className="footer-links">
              <li><a href="#destinations">Destinations</a></li>
              <li><a href="#features">Itinerary Builder</a></li>
              <li><a href="#features">Budget Tracker</a></li>
              <li><a href="#features">AI Suggestions</a></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <ul className="footer-links">
              <li><a href="#">About</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">
            © {new Date().getFullYear()} Travel-Loop. Made with <Heart size={12} fill="var(--cl-accent)" color="var(--cl-accent)" style={{ display: "inline-block", margin: "0 2px" }} /> for explorers.
          </span>
          <div style={{ display: "flex", gap: "var(--sp-md)" }}>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.4)" }}>Twitter</a>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.4)" }}>Instagram</a>
            <a href="#" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", fontSize: "var(--fs-xs)", color: "rgba(244,241,222,0.4)" }}>LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
