import { makeId, useLocalState } from "@/lib/localStore";
import "@/styles/components/packing.css";
import "@/styles/components/ui.css";
import { Luggage, PartyPopper, Package, Sparkles, BarChart2 } from "lucide-react";

export default function PackingChecklistPage() {
  const [localState, setLocalState] = useLocalState();
  const groups  = localState.packingGroups;
  const total   = groups.reduce((s, g) => s + g.items.length, 0);
  const packed  = groups.reduce((s, g) => s + g.items.filter((i) => i.packed).length, 0);
  const pct     = total ? Math.round((packed / total) * 100) : 0;

  const R    = 40;
  const circ = 2 * Math.PI * R;
  const dash = circ - (pct / 100) * circ;

  const toggleItem = (groupId, itemId) =>
    setLocalState((cur) => ({
      ...cur,
      packingGroups: cur.packingGroups.map((g) =>
        g.id !== groupId ? g : {
          ...g,
          items: g.items.map((i) => i.id === itemId ? { ...i, packed: !i.packed } : i),
        }
      ),
    }));

  const addItem = () => {
    const name = window.prompt("Item name:");
    if (!name?.trim()) return;
    setLocalState((cur) => ({
      ...cur,
      packingGroups: cur.packingGroups.map((g, idx) =>
        idx === 0 ? { ...g, items: [...g.items, { id: makeId("pk"), name: name.trim(), packed: false }] } : g
      ),
    }));
  };

  const resetAll = () =>
    setLocalState((cur) => ({
      ...cur,
      packingGroups: cur.packingGroups.map((g) => ({
        ...g,
        items: g.items.map((i) => ({ ...i, packed: false })),
      })),
    }));

  return (
    <div className="packing-root">
      {/* Header */}
      <div className="packing-header">
        <h1 className="packing-title">Packing Checklist</h1>
        <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
          <button className="btn btn-secondary btn-sm" onClick={resetAll}>Reset All</button>
          <button className="btn btn-primary btn-sm" onClick={addItem}>+ Add Item</button>
        </div>
      </div>

      {/* Progress banner */}
      <div className="packing-progress-wrap">
        <div className="packing-progress-info">
          <div className="packing-progress-label" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Luggage size={16} /> Packing Progress</div>
          <div className="packing-progress-title">
            {packed} of {total} items packed
          </div>
          <div className="packing-progress-sub">
            {pct === 100 ? <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)" }}><PartyPopper size={14} /> You're all packed! Have a great trip!</span> : `${total - packed} items remaining`}
          </div>
          <div className="packing-progress-track">
            <div className="packing-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Ring */}
        <div className="packing-progress-ring">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle className="packing-ring-bg"   cx="50" cy="50" r={R} strokeWidth="10" fill="none" />
            <circle
              className="packing-ring-fill"
              cx="50" cy="50" r={R}
              strokeWidth="10" fill="none"
              strokeDasharray={circ}
              strokeDashoffset={dash}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
          <div className="packing-progress-pct">{pct}%</div>
        </div>
      </div>

      {/* Groups */}
      <div>
        {groups.map((group) => {
          const done = group.items.filter((i) => i.packed).length;
          return (
            <div key={group.id} className="packing-group">
              <div className="packing-group-header">
                <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)" }}>
                  <span style={{ display: "flex" }}><Package size={18} /></span>
                  <span className="packing-group-title">{group.title}</span>
                </div>
                <span className="packing-group-count">{done}/{group.items.length}</span>
              </div>

              <div className="packing-items-list">
                {group.items.map((item) => (
                  <label key={item.id} className={`packing-item${item.packed ? " packed" : ""}`}>
                    <input
                      type="checkbox"
                      className="packing-checkbox"
                      checked={item.packed}
                      onChange={() => toggleItem(group.id, item.id)}
                    />
                    <span className="packing-item-name">{item.name}</span>
                  </label>
                ))}
                {group.items.length === 0 && (
                  <div style={{ color: "var(--cl-text-subtle)", fontSize: "var(--fs-xs)", padding: "var(--sp-sm) 0" }}>
                    No items in this group
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Sidebar */}
      <div className="packing-sidebar">
        <div className="packing-ai-card">
          <div className="packing-ai-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Sparkles size={18} color="var(--cl-warm)" /> AI Suggestions</div>
          <p className="packing-ai-desc">
            Let AI generate a personalised packing list based on your destination, weather, and trip duration.
          </p>
          <button className="btn btn-primary" style={{ width: "100%" }}>
            Generate List
          </button>
        </div>

        <div style={{ background: "var(--cl-bg)", border: "1px solid var(--cl-border)", borderRadius: "var(--br-xl)", padding: "var(--sp-lg)" }}>
          <div style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: "var(--cl-text)", marginBottom: "var(--sp-md)", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
            <BarChart2 size={16} /> Summary
          </div>
          {[
            { label: "Total Items", value: total },
            { label: "Packed",      value: packed, color: "var(--cl-teal)"   },
            { label: "Remaining",   value: total - packed, color: "var(--cl-accent)" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--sp-xs)", fontSize: "var(--fs-sm)" }}>
              <span style={{ color: "var(--cl-text-muted)" }}>{s.label}</span>
              <span style={{ fontWeight: "var(--fw-bold)", color: s.color || "var(--cl-text)" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
