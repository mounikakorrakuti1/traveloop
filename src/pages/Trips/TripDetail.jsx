import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteTrip, getTrip, publishTrip } from "@/api/trips.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { formatDate, getTripBudget, usd } from "@/lib/format";
import { getTripCardCoverUrl } from "@/lib/tripCover";
import { useToast } from "@/components/shared/toast-context";
import { SmartImage } from "@/components/shared/SmartImage";
import { SearchX, Calendar, Banknote, Luggage, StickyNote, MapPin, FileText, Image as ImageIcon, Share2, Trash2, Copy, ExternalLink, Lock, Globe, Plane } from "lucide-react";
import "@/styles/components/trips.css";
import "@/styles/components/ui.css";

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.trip(id ?? ""),
    queryFn: () => getTrip(id),
    enabled: Boolean(id),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishTrip(id, !trip?.isPublic),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.trip(id ?? "") });
      showToast(result.publicSlug ? `Public link ready: /public/trips/${result.publicSlug}` : "Trip is private again.", "success");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const shareUrl = trip?.publicSlug ? `${window.location.origin}/public/trips/${trip.publicSlug}` : "";
  const copyShareLink = async () => {
    if (!shareUrl) return showToast("Publish this trip before copying a public link.", "error");
    await navigator.clipboard.writeText(shareUrl);
    showToast("Share link copied.", "success");
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate(ROUTES.trips, { replace: true });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  if (isLoading) return <div className="trips-root" style={{ maxWidth: "1200px", margin: "0 auto" }}><div className="empty-state">Loading trip details...</div></div>;

  if (isError || !trip) {
    return (
      <div className="trips-root" style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", padding: "var(--sp-4xl) var(--sp-xl)", background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", marginTop: "var(--sp-2xl)" }}>
        <div style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-md)", display: "flex", justifyContent: "center" }}><SearchX size={64} /></div>
        <h1 className="trips-title" style={{ fontSize: "var(--fs-2xl)", marginBottom: "var(--sp-xs)" }}>Trip Not Found</h1>
        <p style={{ color: "var(--cl-text-muted)", marginBottom: "var(--sp-xl)", fontSize: "var(--fs-lg)" }}>This itinerary may have been deleted or belongs to another account.</p>
        <Link to={ROUTES.trips} className="btn btn-primary btn-lg">Back to My Trips</Link>
      </div>
    );
  }

  const managementLinks = [
    { label: "Itinerary Builder", icon: Calendar, to: ROUTES.tripItinerary(trip.id), desc: "Add stops, dates, and schedule your activities." },
    { label: "Budget Breakdown", icon: Banknote, to: ROUTES.tripBudget(trip.id), desc: "Track expenses and get AI cost estimates." },
    { label: "Packing Checklist", icon: Luggage, to: ROUTES.tripPacking(trip.id), desc: "Smart packing suggestions for your destination." },
    { label: "Trip Notes", icon: StickyNote, to: ROUTES.tripNotes(trip.id), desc: "Store important information, tips, and thoughts." },
    { label: "Documents", icon: FileText, to: ROUTES.tripDocs(trip.id), desc: "Keep flight tickets, bookings, and IDs handy." },
    { label: "Media Gallery", icon: ImageIcon, to: ROUTES.tripMedia(trip.id), desc: "Upload and share your favorite travel photos." },
  ];

  return (
    <div className="trips-root" style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "var(--sp-4xl)" }}>
      
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div style={{ position: "relative", borderRadius: "var(--br-2xl)", overflow: "hidden", marginBottom: "var(--sp-2xl)", height: "320px", display: "flex", alignItems: "flex-end", padding: "var(--sp-2xl)", boxShadow: "var(--shadow-md)" }}>
        <SmartImage 
          src={trip.coverPhotoUrl} 
          fallbackSrc={getTripCardCoverUrl(trip)} 
          alt={trip.title} 
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} 
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)", zIndex: 1 }} />
        
        <div style={{ position: "relative", zIndex: 2, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--sp-lg)" }}>
          <div style={{ color: "white" }}>
            <Link to={ROUTES.trips} style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", marginBottom: "var(--sp-sm)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", transition: "color var(--tr-fast)" }}>← Back to trips</Link>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", marginBottom: "var(--sp-xs)" }}>
              <span style={{ background: trip.status === "completed" ? "var(--cl-teal)" : trip.status === "ongoing" ? "var(--cl-warning)" : "var(--cl-accent)", color: "white", padding: "4px 10px", borderRadius: "var(--br-full)", fontSize: "0.7rem", fontWeight: "var(--fw-bold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {trip.status?.toUpperCase() || "PLANNING"}
              </span>
              {trip.isPublic && <span style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", color: "white", padding: "4px 10px", borderRadius: "var(--br-full)", fontSize: "0.7rem", fontWeight: "var(--fw-bold)", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}><Globe size={12} /> PUBLIC</span>}
            </div>
            
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800", margin: "0 0 var(--sp-xs) 0", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{trip.title}</h1>
            
            <div style={{ display: "flex", gap: "var(--sp-md)", color: "rgba(255,255,255,0.9)", fontSize: "var(--fs-md)", flexWrap: "wrap", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={16} /> {trip.tripType}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Calendar size={16} /> {formatDate(trip.startDate)} to {formatDate(trip.endDate)}</span>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "var(--sp-sm)", flexWrap: "wrap" }}>
            <button className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }} disabled={publishMutation.isPending} onClick={() => publishMutation.mutate()}>
              {trip.isPublic ? <Lock size={16} /> : <Globe size={16} />} {trip.isPublic ? "Make Private" : "Publish"}
            </button>
            <button className="btn" style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }} disabled={!trip.publicSlug} onClick={copyShareLink}>
              <Copy size={16} /> Link
            </button>
            <button className="btn" style={{ background: "rgba(230,57,70,0.8)", color: "white", backdropFilter: "blur(8px)", border: "1px solid rgba(230,57,70,0.5)" }} disabled={deleteMutation.isPending} onClick={() => window.confirm("Delete this trip? This action cannot be undone.") && deleteMutation.mutate()}>
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--sp-sm)", alignItems: "center", marginBottom: "var(--sp-xl)", borderBottom: "1px solid var(--cl-border)", paddingBottom: "var(--sp-sm)" }}>
        <Plane size={24} color="var(--cl-accent)" />
        <h2 style={{ fontSize: "var(--fs-xl)", margin: 0 }}>Trip Management</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "var(--sp-lg)", marginBottom: "var(--sp-3xl)" }}>
        {managementLinks.map((link) => (
          <Link key={link.to} to={link.to} className="card card-hover" style={{ textDecoration: "none", display: "flex", alignItems: "flex-start", gap: "var(--sp-md)", padding: "var(--sp-lg)", border: "1px solid var(--cl-border)", borderRadius: "var(--br-xl)", background: "var(--cl-surface)" }}>
            <div style={{ color: "var(--cl-accent)", background: "var(--cl-bg-subtle)", padding: "var(--sp-sm)", borderRadius: "var(--br-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <link.icon size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--cl-text-on-surface)", marginBottom: "4px" }}>{link.label}</div>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--cl-text-on-surface)", opacity: 0.7, margin: 0, lineHeight: 1.5 }}>{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: "var(--sp-lg)", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: 1, minWidth: "15rem", background: "var(--cl-surface)", border: "1px solid var(--cl-border)", padding: "var(--sp-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-text-on-surface)", opacity: 0.6, marginBottom: "var(--sp-sm)", fontWeight: "var(--fw-semibold)", textTransform: "uppercase", fontSize: "var(--fs-xs)", letterSpacing: "0.05em" }}>
            <Banknote size={16} /> Total Budget
          </div>
          <div style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: "800", color: "var(--cl-teal)" }}>{usd(getTripBudget(trip))}</div>
          <p style={{ color: "var(--cl-text-on-surface)", opacity: 0.7, fontSize: "var(--fs-sm)", margin: "var(--sp-xs) 0 0 0" }}>Cumulative total of all planned activities and expenses.</p>
        </div>
        
        <div className="card" style={{ flex: 1, minWidth: "20rem", background: "var(--cl-surface)", border: "1px solid var(--cl-border)", padding: "var(--sp-xl)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-text-on-surface)", opacity: 0.6, marginBottom: "var(--sp-sm)", fontWeight: "var(--fw-semibold)", textTransform: "uppercase", fontSize: "var(--fs-xs)", letterSpacing: "0.05em" }}>
            <Globe size={16} /> Public Sharing
          </div>
          
          <div style={{ background: "var(--cl-bg)", padding: "var(--sp-sm) var(--sp-md)", borderRadius: "var(--br-md)", fontSize: "var(--fs-sm)", color: trip.publicSlug ? "var(--cl-text)" : "var(--cl-text-muted)", overflowWrap: "anywhere", fontFamily: "monospace", border: "1px solid var(--cl-border)", marginBottom: "var(--sp-md)" }}>
            {shareUrl || "Trip is currently private. Publish to generate a shareable link."}
          </div>
          
          <div style={{ display: "flex", gap: "var(--sp-sm)", flexWrap: "wrap" }}>
            <button className="btn btn-primary" disabled={!trip.publicSlug} onClick={copyShareLink}>
              <Share2 size={16} /> Copy URL
            </button>
            {trip.publicSlug && (
              <Link className="btn btn-secondary" to={`/public/trips/${trip.publicSlug}`} target="_blank">
                <ExternalLink size={16} /> View Public Page
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
