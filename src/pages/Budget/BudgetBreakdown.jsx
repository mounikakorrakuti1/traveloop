import { makeId, useLocalState } from "@/lib/localStore";
import "@/styles/components/budget.css";
import "@/styles/components/ui.css";
import { Map, MapPin, Lightbulb, CheckCircle, FileText } from "lucide-react";

export default function BudgetBreakdownPage() {
  const [localState, setLocalState] = useLocalState();
  const rows    = localState.invoiceRows;
  const trip    = localState.trips[0];
  const subtotal = rows.reduce((s, r) => s + (Number(r.unitCost) || 0), 0);
  const tax      = Math.round(subtotal * 0.05);
  const discount = 50;
  const total    = subtotal + tax - discount;
  const spent    = subtotal;
  const budget   = trip?.budget || 0;
  const pct      = budget > 0 ? Math.min(Math.round((spent / budget) * 100), 100) : 0;

  /* circumference for ring */
  const R = 40, circ = 2 * Math.PI * R;
  const dash = circ - (pct / 100) * circ;

  const addRow = () =>
    setLocalState((cur) => ({
      ...cur,
      invoiceRows: [
        ...cur.invoiceRows,
        { id: makeId("row"), category: "other", description: "New expense", qty: "1", unitCost: 0 },
      ],
    }));

  const updateRow = (id, key, value) =>
    setLocalState((cur) => ({
      ...cur,
      invoiceRows: cur.invoiceRows.map((r) =>
        r.id === id ? { ...r, [key]: key === "unitCost" ? Number(value) || 0 : value } : r
      ),
    }));

  const removeRow = (id) =>
    setLocalState((cur) => ({
      ...cur,
      invoiceRows: cur.invoiceRows.filter((r) => r.id !== id),
    }));

  return (
    <div className="budget-root">
      {/* Header */}
      <div className="budget-header">
        <h1 className="budget-title">Budget Breakdown</h1>
        <button className="btn btn-secondary">Export PDF</button>
      </div>

      {/* Summary grid */}
      <div className="budget-summary-grid">
        {/* Invoice card */}
        <div className="budget-invoice-card">
          <div className="invoice-trip-meta">
            <div className="invoice-logo" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><Map size={32} /></div>
            <div>
              <div className="invoice-trip-name">{trip?.title || "Trip Invoice"}</div>
              <div className="invoice-trip-dates">
                {trip?.startDate && `${trip.startDate} → ${trip.endDate}`}
              </div>
              <div className="invoice-trip-place" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><MapPin size={14} /> {trip?.place || "TBD"}</div>
            </div>
            <div>
              <div>
                <div className="invoice-meta-label">Invoice ID</div>
                <div className="invoice-meta-value">TL-{(trip?.id || "LOCAL").slice(-6).toUpperCase()}</div>
              </div>
              <div style={{ marginTop: "var(--sp-sm)" }}>
                <div className="invoice-meta-label">Status</div>
                <span className="badge badge-warm">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insight card */}
        <div className="budget-insight-card">
          <h3 className="budget-insight-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Lightbulb size={18} color="var(--cl-warm)" /> Budget Insights</h3>

          <div className="budget-chart-ring">
            <div className="budget-ring-chart">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle className="ring-bg"   cx="50" cy="50" r={R} strokeWidth="10" fill="none" />
                <circle
                  className="ring-fill"
                  cx="50" cy="50" r={R}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={circ}
                  strokeDashoffset={dash}
                />
              </svg>
              <div className="ring-pct">{pct}%</div>
            </div>
            <div className="budget-ring-legend">
              <div className="budget-legend-item">
                <span className="legend-label">Total Budget</span>
                <span className="legend-value">₹{budget.toLocaleString()}</span>
              </div>
              <div className="budget-legend-item">
                <span className="legend-label">Spent</span>
                <span className="legend-value" style={{ color: "var(--cl-accent)" }}>₹{spent.toLocaleString()}</span>
              </div>
              <div className="budget-legend-item">
                <span className="legend-label">Remaining</span>
                <span className="legend-value" style={{ color: "var(--cl-teal)" }}>₹{Math.max(0, budget - spent).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button className="btn btn-surface" style={{ width: "100%" }}>View Full Report</button>
        </div>
      </div>

      {/* Expense table */}
      <div className="budget-table-wrap">
        <table className="budget-table">
          <thead>
            <tr>
              {["#", "Category", "Description", "Qty / Details", "Unit Cost", "Amount", ""].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id}>
                <td style={{ color: "var(--cl-text-muted)", width: "2rem" }}>{i + 1}</td>
                {["category", "description", "qty"].map((key) => (
                  <td key={key}>
                    <input
                      value={row[key]}
                      onChange={(e) => updateRow(row.id, key, e.target.value)}
                      placeholder={key}
                    />
                  </td>
                ))}
                <td>
                  <input
                    type="number"
                    value={row.unitCost || ""}
                    onChange={(e) => updateRow(row.id, "unitCost", e.target.value)}
                    placeholder="0"
                  />
                </td>
                <td style={{ fontWeight: "var(--fw-semibold)", color: "var(--cl-teal)" }}>
                  ₹{Number(row.unitCost).toLocaleString()}
                </td>
                <td>
                  <button
                    onClick={() => removeRow(row.id)}
                    className="btn btn-ghost btn-xs"
                    style={{ color: "var(--cl-error)" }}
                    title="Remove row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{ textAlign: "right", color: "var(--cl-text-muted)", paddingRight: "var(--sp-md)" }}>
                Subtotal
              </td>
              <td>₹{subtotal.toLocaleString()}</td>
              <td />
            </tr>
            <tr>
              <td colSpan={5} style={{ textAlign: "right", color: "var(--cl-text-muted)", paddingRight: "var(--sp-md)" }}>
                Tax (5%)
              </td>
              <td>₹{tax.toLocaleString()}</td>
              <td />
            </tr>
            <tr>
              <td colSpan={5} style={{ textAlign: "right", color: "var(--cl-text-muted)", paddingRight: "var(--sp-md)" }}>
                Discount
              </td>
              <td style={{ color: "var(--cl-teal)" }}>-₹{discount}</td>
              <td />
            </tr>
            <tr style={{ background: "var(--cl-bg-alt)" }}>
              <td colSpan={5} style={{ textAlign: "right", fontWeight: "var(--fw-bold)", paddingRight: "var(--sp-md)" }}>
                Total
              </td>
              <td className="budget-total-amount">₹{total.toLocaleString()}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        <div className="budget-table-footer-actions">
          <button className="btn btn-secondary btn-sm" onClick={addRow}>
            + Add Expense Row
          </button>
          <div style={{ display: "flex", gap: "var(--sp-sm)" }}>
            <button className="btn btn-teal btn-sm" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><CheckCircle size={14} /> Mark as Paid</button>
            <button className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><FileText size={14} /> Export PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
}
