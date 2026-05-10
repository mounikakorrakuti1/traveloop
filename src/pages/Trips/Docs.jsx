import { FileText, Plus, Download } from "lucide-react";
import "@/styles/components/ui.css";

export default function DocsPage() {
  return (
    <div className="trips-root">
      <div className="trips-header">
        <h1 className="trips-title">Trip Documents</h1>
        <button className="btn btn-primary">+ Upload Document</button>
      </div>
      <div className="notes-grid">
        {["Flight Ticket.pdf", "Hotel Booking.pdf", "Travel Insurance.pdf"].map((doc) => (
          <div key={doc} className="card card-hover" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-md)" }}>
              <div style={{ color: "var(--cl-accent)" }}><FileText size={24} /></div>
              <span className="note-card-title" style={{ marginBottom: 0 }}>{doc}</span>
            </div>
            <button className="btn btn-ghost btn-icon"><Download size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
