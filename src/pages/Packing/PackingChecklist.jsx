import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrip } from "@/api/trips.api";
import { createPackingItem, deletePackingItem, listPackingItems, updatePackingItem } from "@/api/packing.api";
import { generatePackingList } from "@/api/ai.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/shared/toast-context";
import { useAuthStore } from "@/store/authStore";
import { AiThinkingPanel } from "@/components/ai/AiThinkingPanel";
import { SkeletonRow } from "@/components/shared/Skeleton";
import "@/styles/components/packing.css";
import "@/styles/components/ui.css";
import { Luggage, PartyPopper, Package, Sparkles, Trash2, ArrowLeft, CheckCircle2, Check } from "lucide-react";

function daysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.round((end - start) / 86400000) + 1;
  return Number.isFinite(days) && days > 0 ? days : 1;
}

export default function PackingChecklistPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [draft, setDraft] = useState({ name: "", category: "Essentials" });

  const { data: trip } = useQuery({ queryKey: QUERY_KEYS.trip(id ?? ""), queryFn: () => getTrip(id), enabled: Boolean(id) });
  const { data: items = [], isLoading } = useQuery({ queryKey: QUERY_KEYS.packing(id ?? ""), queryFn: () => listPackingItems(id), enabled: Boolean(id) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.packing(id ?? "") });

  const createMutation = useMutation({
    mutationFn: (body) => createPackingItem(id, body),
    onSuccess: () => { setDraft({ name: "", category: draft.category }); invalidate(); },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });
  
  const updateMutation = useMutation({ mutationFn: ({ itemId, body }) => updatePackingItem(id, itemId, body), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  const deleteMutation = useMutation({ mutationFn: (itemId) => deletePackingItem(id, itemId), onSuccess: invalidate, onError: (err) => showToast(getApiErrorMessage(err), "error") });
  
  const aiMutation = useMutation({
    mutationFn: () => generatePackingList({
      destination: trip?.title || "the trip",
      days: daysBetween(formatDate(trip?.startDate), formatDate(trip?.endDate)),
      tripType: trip?.tripType || "solo",
      season: trip?.vibe || undefined,
      userContext: `${user?.travelerProfile || "traveller"} packing for ${trip?.tripType || "travel"}`
    }),
    onSuccess: async (groups) => {
      for (const group of groups) {
        for (const item of group.items || []) {
          await createPackingItem(id, { name: item, category: group.category || "AI Suggestions", isPacked: false, aiSuggested: true });
        }
      }
      invalidate();
      showToast("AI packing list added to your checklist.", "success");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const grouped = useMemo(() => items.reduce((acc, item) => {
    const key = item.category || "General";
    acc[key] = [...(acc[key] || []), item];
    return acc;
  }, {}), [items]);
  
  const packed = items.filter((item) => item.isPacked).length;
  const pct = items.length ? Math.round((packed / items.length) * 100) : 0;
  const isComplete = pct === 100 && items.length > 0;

  const addItem = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    createMutation.mutate({ name: draft.name.trim(), category: draft.category.trim() || "General", isPacked: false });
  };

  return (
    <div className="packing-root" style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "var(--sp-4xl)" }}>
      
      {/* ── Header ────────────────────────────────────── */}
      <div style={{ marginBottom: "var(--sp-2xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "var(--sp-lg)" }}>
        <div>
          <Link to={ROUTES.tripDetail(id)} style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-text-muted)", textDecoration: "none", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", marginBottom: "var(--sp-md)", transition: "color var(--tr-fast)" }} className="hover-accent">
            <ArrowLeft size={16} /> Back to Trip Overview
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", marginBottom: "var(--sp-xs)" }}>
            <Luggage size={28} color="var(--cl-accent)" />
            <h1 className="packing-title" style={{ fontSize: "var(--fs-3xl)", margin: 0 }}>Packing Checklist</h1>
          </div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", margin: 0 }}>Smart packing list for {trip?.title || "your upcoming trip"}.</p>
        </div>
        
        <button className="btn" style={{ background: "linear-gradient(135deg, var(--cl-accent) 0%, #D86B50 100%)", color: "white", border: "none" }} disabled={!trip || aiMutation.isPending} onClick={() => aiMutation.mutate()}>
          <Sparkles size={16} /> Auto-generate List
        </button>
      </div>

      {/* ── Progress Widget ───────────────────────────── */}
      <div className="card" style={{ padding: "var(--sp-xl)", marginBottom: "var(--sp-2xl)", border: isComplete ? "1px solid var(--cl-teal)" : "1px solid var(--cl-border)", background: isComplete ? "rgba(42, 157, 143, 0.05)" : "var(--cl-surface)", position: "relative", overflow: "hidden" }}>
        {isComplete && <div style={{ position: "absolute", right: "-20px", top: "-20px", opacity: 0.1, color: "var(--cl-teal)", transform: "rotate(15deg)" }}><PartyPopper size={150} /></div>}
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--sp-md)" }}>
            <div>
              <div style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-bold)", color: "var(--cl-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={14} /> Progress
              </div>
              <div style={{ fontSize: "var(--fs-xl)", fontWeight: "var(--fw-bold)", color: "var(--cl-text)" }}>
                {packed} of {items.length} items packed
              </div>
            </div>
            <div style={{ fontSize: "var(--fs-3xl)", fontWeight: "800", color: isComplete ? "var(--cl-teal)" : "var(--cl-accent)", lineHeight: 1 }}>
              {pct}%
            </div>
          </div>
          
          <div style={{ width: "100%", height: "12px", background: "var(--cl-bg-subtle)", borderRadius: "var(--br-full)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: isComplete ? "var(--cl-teal)" : "var(--cl-accent)", borderRadius: "var(--br-full)", transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </div>
          
          <div style={{ marginTop: "var(--sp-sm)", fontSize: "var(--fs-sm)", color: "var(--cl-text-muted)" }}>
            {isComplete ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-teal)", fontWeight: "var(--fw-medium)" }}><PartyPopper size={16} /> All set! You're ready to go.</span>
            ) : (
              `${items.length - packed} items remaining to pack`
            )}
          </div>
        </div>
      </div>

      {aiMutation.isPending && (
        <div style={{ animation: "fade-in 0.3s ease-out" }}>
          <AiThinkingPanel title="Curating a personalized packing list" destination={trip?.title || "this trip"} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "var(--sp-3xl)", alignItems: "start" }}>
        
        {/* ── Checklist Container ───────────────────────── */}
        <div>
          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)" }}>
              {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--sp-4xl) var(--sp-xl)", background: "var(--cl-surface)", borderRadius: "var(--br-2xl)" }}>
              <Luggage size={48} color="var(--cl-text-muted)" style={{ marginBottom: "var(--sp-md)" }} />
              <h3 style={{ fontSize: "var(--fs-xl)", marginBottom: "var(--sp-xs)" }}>Your bag is empty</h3>
              <p style={{ color: "var(--cl-text-muted)" }}>Generate an AI list or start adding items manually.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-2xl)" }}>
              {Object.entries(grouped).map(([category, groupItems]) => {
                const groupPacked = groupItems.filter((i) => i.isPacked).length;
                const groupTotal = groupItems.length;
                const groupComplete = groupPacked === groupTotal;
                
                return (
                  <div key={category} className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--cl-border)", background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", opacity: groupComplete ? 0.8 : 1, transition: "opacity var(--tr-fast)" }}>
                    <div style={{ padding: "var(--sp-lg) var(--sp-xl)", background: "var(--cl-bg-subtle)", borderBottom: "1px solid var(--cl-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--cl-text)" }}>
                        <Package size={20} color="var(--cl-accent)" /> {category}
                      </div>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: groupComplete ? "var(--cl-teal)" : "var(--cl-text-muted)" }}>
                        {groupPacked}/{groupTotal}
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {groupItems.map((item) => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "var(--sp-md) var(--sp-xl)", borderBottom: "1px solid var(--cl-bg-subtle)", transition: "background var(--tr-fast)", background: item.isPacked ? "rgba(42, 157, 143, 0.02)" : "transparent" }} className="hover-bg-subtle">
                          
                          <button onClick={() => updateMutation.mutate({ itemId: item.id, body: { isPacked: !item.isPacked } })} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "6px", background: item.isPacked ? "var(--cl-teal)" : "transparent", border: item.isPacked ? "none" : "2px solid var(--cl-text-muted)", cursor: "pointer", transition: "all var(--tr-fast)", padding: 0, marginRight: "var(--sp-md)", flexShrink: 0 }}>
                            {item.isPacked && <Check size={16} color="white" />}
                          </button>
                          
                          <div style={{ flex: 1, fontSize: "var(--fs-md)", color: item.isPacked ? "var(--cl-text-muted)" : "var(--cl-text)", textDecoration: item.isPacked ? "line-through" : "none", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
                            {item.name} 
                            {item.aiSuggested && <Sparkles size={12} color="var(--cl-warm)" title="AI Suggested" />}
                          </div>
                          
                          <button className="btn btn-ghost btn-icon" style={{ width: "32px", height: "32px", color: "var(--cl-text-muted)", opacity: 0.5, ':hover': { opacity: 1, color: "var(--cl-error)" } }} onClick={() => deleteMutation.mutate(item.id)} title="Remove item">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Add Item Form Sidebar ─────────────────────── */}
        <div style={{ position: "sticky", top: "var(--sp-2xl)" }}>
          <form className="card" onSubmit={addItem} style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)", background: "var(--cl-surface)", border: "1px solid var(--cl-border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "var(--fs-lg)", margin: "0 0 var(--sp-xs) 0" }}>Add Custom Item</h3>
            
            <div className="input-wrap">
              <label className="input-label">Item Name</label>
              <input className="input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Universal Adapter" />
            </div>
            
            <div className="input-wrap">
              <label className="input-label">Category</label>
              <select className="input" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}>
                <option value="Essentials">Essentials</option>
                <option value="Clothing">Clothing</option>
                <option value="Toiletries">Toiletries</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents</option>
                <option value="Health">Health & Meds</option>
                <option value="Misc">Miscellaneous</option>
              </select>
            </div>
            
            <button className="btn btn-primary" style={{ width: "100%", marginTop: "var(--sp-xs)" }} disabled={!draft.name.trim() || createMutation.isPending}>
              Add to List
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
