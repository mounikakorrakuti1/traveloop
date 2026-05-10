import { useState } from "react";
import { makeId, useLocalState } from "@/lib/localStore";
import "@/styles/components/notes.css";
import "@/styles/components/ui.css";
import { CheckCircle, StickyNote, Trash2 } from "lucide-react";

export default function TripNotesPage() {
  const [localState, setLocalState] = useLocalState();
  const notes = localState.notes;
  const [filter, setFilter]         = useState("all");
  const [composing, setComposing]   = useState(false);
  const [draft, setDraft]           = useState({ title: "", body: "" });

  const addNote = () => {
    if (!draft.title.trim() && !draft.body.trim()) return;
    setLocalState((cur) => ({
      ...cur,
      notes: [
        {
          id:        makeId("note"),
          title:     draft.title || "Untitled Note",
          body:      draft.body,
          createdAt: new Date().toLocaleDateString("en-IN"),
          tag:       "general",
        },
        ...cur.notes,
      ],
    }));
    setDraft({ title: "", body: "" });
    setComposing(false);
  };

  const removeNote = (id) =>
    setLocalState((cur) => ({
      ...cur,
      notes: cur.notes.filter((n) => n.id !== id),
    }));

  return (
    <div className="notes-root">
      {/* Header */}
      <div className="notes-header">
        <h1 className="notes-title">Trip Notes</h1>
        <button className="btn btn-primary" onClick={() => setComposing((c) => !c)}>
          {composing ? "✕ Cancel" : "+ New Note"}
        </button>
      </div>

      {/* Compose */}
      {composing && (
        <div className="card" style={{ marginBottom: "var(--sp-lg)", animation: "fadeUp 0.3s var(--tr-slow) both" }}>
          <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}>
            <label className="input-label">Title</label>
            <input
              className="input"
              placeholder="Note title…"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </div>
          <div className="input-wrap" style={{ marginBottom: "var(--sp-md)" }}>
            <label className="input-label">Content</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Write your note…"
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            />
          </div>
          <div style={{ display: "flex", gap: "var(--sp-sm)", justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setComposing(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" style={{ display: "flex", gap: "var(--sp-xs)", alignItems: "center" }} onClick={addNote}>Save Note <CheckCircle size={14} /></button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="notes-toolbar">
        {["all", "general", "tips", "bookings"].map((f) => (
          <button
            key={f}
            className={`notes-filter-btn${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: "4px", opacity: 0.6 }}>
              ({f === "all" ? notes.length : notes.filter((n) => n.tag === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><StickyNote size={48} /></div>
          <div className="empty-state-title">No notes yet</div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-sm)" }}>
            Capture memories, tips, and bookings for your trip.
          </p>
          <button className="btn btn-primary" onClick={() => setComposing(true)}>+ Write a Note</button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes
            .filter((n) => filter === "all" || n.tag === filter)
            .map((note) => (
              <div key={note.id} className="note-card">
                <h3 className="note-card-title">{note.title}</h3>
                <p className="note-card-body">{note.body}</p>
                <div className="note-card-footer">
                  <span className="note-card-date">{note.createdAt}</span>
                  <div className="note-card-actions">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => removeNote(note.id)}
                      style={{ color: "var(--cl-error)" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
