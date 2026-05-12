import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { useTheme } from "@/components/layout/ThemeProvider";
import { usd } from "@/lib/format";
import { Map, Banknote, Luggage, StickyNote, Globe, Sparkles, Plane, Calendar, Briefcase, Rocket, Castle, Mountain, Trees, Sun, Moon, Heart } from "lucide-react";
import "@/styles/components/landing.css";
import HeroFrameCanvas from "@/components/landing/HeroFrameCanvas";
import DestinationImage from "@/components/landing/DestinationImage";

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
  { name: "Goa",      trips: "Heritage walk",     category: "cultural",    price: 1500, icon: Castle, big: true, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80" },
  { name: "Gokarna",  trips: "Heritage walk",     category: "cultural",    price: 1500, icon: Castle, image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80" },
  { name: "Goa",      trips: "Local food trail",  category: "food",        price: 1800, icon: Trees, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" },
  { name: "Gokarna",  trips: "Local food trail",  category: "food",        price: 1800, icon: Mountain, image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80" },
  { name: "Goa",      trips: "Museum visit",      category: "sightseeing", price: 800,  icon: Castle, image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80" },
  { name: "Gokarna",  trips: "Museum visit",      category: "sightseeing", price: 800,  icon: Mountain, image: "https://images.unsplash.com/photo-1600100397608-f010a9f7fd50?auto=format&fit=crop&w=1200&q=80" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ background: "var(--cl-bg)" }}>
      {/* ── Hero ──────────────────────────────────────────── */}
      {/*
       * Scroll-track wrapper — creates the tall scrollable region.
       * The section inside is sticky so it stays in view while the
       * user scrolls through the canvas frame sequence.
       */}
      <div className="hero-scroll-track" style={{ height: "600vh" }}>
      <section className="landing-hero hero-sticky">


        {/* Navbar — dark background */}
        <div className="landing-navbar landing-navbar-dark">
          <Link to={ROUTES.landing} className="landing-nav-logo">
            <span className="landing-logo-text">Travel<Plane size={28} style={{ display: "inline-block", marginInline: "4px", verticalAlign: "middle", color: "var(--cl-accent)" }} />Loop</span>
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
                background: "rgba(17, 24, 39, 0.08)",
                border: "1px solid rgba(17, 24, 39, 0.15)",
                color: "#111827",
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
            <Link to={ROUTES.login} className="btn btn-ghost btn-sm" style={{ color: "rgba(17, 24, 39, 0.75)" }}>
              Sign In
            </Link>
            <Link to={ROUTES.signup} className="btn btn-primary btn-sm">
              Sign Up →
            </Link>
          </div>
        </div>

        {/* Canvas frame-sequence background */}
        <div className="hero-canvas-bg">
          <HeroFrameCanvas />
        </div>

        {/* ── Scroll mouse indicator — bottom center ── */}
        <div className="hero-scroll-hint" aria-label="Scroll to explore">
          <div className="scroll-mouse">
            <div className="scroll-mouse-wheel" />
          </div>
          <span className="scroll-mouse-label">Scroll to explore</span>
        </div>
      </section>
      </div> {/* end .hero-scroll-track */}

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" style={{ padding: "var(--sp-3xl) var(--sp-xl)", background: "var(--cl-bg)" }}>
        <div style={{ maxWidth: "var(--max-w-2xl)", margin: "0 auto" }}>
          <div className="landing-section-header">
            <div className="landing-section-label">Everything you need</div>
            <h2 className="landing-section-title">
              Your complete travel planning toolkit
            </h2>
            <p className="landing-section-desc">
              From first idea to final memory — Travel<Plane size={14} style={{ display: "inline-block", marginInline: "1px", verticalAlign: "middle" }} />Loop covers every step of your journey.
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
            {destinations.map((d, index) => (
              <div key={`${d.name}-${index}`} className={`dest-card${d.big ? " dest-card-big" : ""}`}>
                <DestinationImage 
                  name={d.name} 
                  city={d.name} 
                  query={`${d.trips} in ${d.name}`} 
                  icon={d.icon} 
                  big={d.big} 
                  imageUrl={d.image}
                />
                <div className="dest-card-overlay" />
                <div className="dest-card-content">
                  <div className="dest-card-name">{d.trips} in {d.name}</div>
                  <div className="dest-card-trips">{d.category} - {usd(d.price)}</div>
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
              Join thousands of travellers who plan smarter with Travel<Plane size={14} style={{ display: "inline-block", marginInline: "1px", verticalAlign: "middle" }} />Loop.
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
                Get Started →
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
              <span className="landing-logo-text">Travel<Plane size={28} style={{ display: "inline-block", marginInline: "4px", verticalAlign: "middle", color: "var(--cl-accent)" }} />Loop</span>
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
