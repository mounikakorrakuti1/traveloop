import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMedia, deleteMedia, listMedia, signUpload } from "@/api/media.api";
import { getApiErrorMessage } from "@/api/client";
import { useToast } from "@/components/shared/toast-context";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { SkeletonRow } from "@/components/shared/Skeleton";
import { Download, FileText, Search, ShieldCheck, Trash2, Upload, ArrowLeft, Calendar, FileType, CheckCircle } from "lucide-react";
import "@/styles/components/ui.css";
import "@/styles/components/trips.css";

const documentTypes = [
  ["passport", "Passport"],
  ["visa", "Visa"],
  ["ticket", "Tickets"],
  ["hotel", "Hotel confirmations"],
  ["insurance", "Travel insurance"],
  ["custom", "Custom Document"],
];

const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp", "text/plain"];

async function uploadDocumentToCloudinary(file, tripId) {
  if (!allowedTypes.includes(file.type)) throw new Error("Upload PDF, image, or text documents only.");
  if (file.size > 25 * 1024 * 1024) throw new Error("Document must be below 25 MB.");
  const signed = await signUpload({ folder: `traveloop/trips/${tripId}/documents`, resourceType: file.type.startsWith("image/") ? "image" : "raw" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", signed.timestamp);
  formData.append("signature", signed.signature);
  formData.append("folder", signed.folder);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`, { method: "POST", body: formData });
  if (!response.ok) throw new Error("Document upload failed. Check Cloudinary settings and try again.");
  return response.json();
}

export default function DocsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [draft, setDraft] = useState({ documentType: "ticket", caption: "", expiresAt: "" });
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const { data = [], isLoading } = useQuery({ queryKey: ["trip-media", id], queryFn: () => listMedia(id), enabled: Boolean(id) });
  const documents = useMemo(() => data.filter((item) => item.mediaType === "document"), [data]);
  const filtered = documents.filter((doc) => `${doc.fileName} ${doc.documentType} ${doc.caption}`.toLowerCase().includes(query.toLowerCase()));
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["trip-media", id] });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const uploaded = await uploadDocumentToCloudinary(file, id);
      return createMedia(id, {
        mediaType: "document",
        cloudinaryUrl: uploaded.secure_url,
        cloudinaryId: uploaded.public_id,
        caption: draft.caption || undefined,
        documentType: draft.documentType,
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        expiresAt: draft.expiresAt || undefined,
      });
    },
    onSuccess: () => {
      invalidate();
      setDraft({ documentType: "ticket", caption: "", expiresAt: "" });
      setSelectedFile(null);
      showToast("Document uploaded securely.", "success");
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (mediaId) => deleteMedia(id, mediaId),
    onSuccess: invalidate,
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      return showToast("Only PDF, Images, or Text files allowed.", "error");
    }
    if (file.size > 25 * 1024 * 1024) {
      return showToast("File size must be under 25MB.", "error");
    }
    setSelectedFile(file);
  };

  const submitUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="trips-root" style={{ maxWidth: "var(--max-w-xl)", paddingBottom: "var(--sp-4xl)" }}>
      <header className="trip-docs-page-header">
        <div className="trip-docs-page-header-main">
          <Link to={ROUTES.tripDetail(id)} style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-xs)", color: "var(--cl-text-muted)", textDecoration: "none", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)", marginBottom: "var(--sp-md)", transition: "color var(--tr-fast)" }} className="hover-accent">
            <ArrowLeft size={16} /> Back to Trip Overview
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-sm)", marginBottom: "var(--sp-xs)" }}>
            <FileText size={28} color="var(--cl-accent)" />
            <h1 className="trips-title" style={{ fontSize: "var(--fs-3xl)", margin: 0 }}>Trip Documents</h1>
          </div>
          <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", margin: 0 }}>Securely store tickets, visas, insurance, and confirmations.</p>
        </div>
        <div className="trip-docs-badge">
          <ShieldCheck size={16} /> Secure Vault
        </div>
      </header>

      <div className="trip-docs-layout">
        
        {/* ── Main Documents List ─────────────────────── */}
        <div>
          <div className="doc-toolbar">
            <span className="doc-toolbar-icon" aria-hidden>
              <Search size={18} />
            </span>
            <input
              className="input doc-toolbar-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, type, or notes..."
              style={{ background: "var(--cl-surface)", borderRadius: "var(--br-xl)", border: "1px solid var(--cl-border)", boxShadow: "var(--shadow-sm)" }}
            />
          </div>

          {isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)" }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ background: "var(--cl-surface)", borderRadius: "var(--br-2xl)", padding: "var(--sp-4xl) var(--sp-xl)", border: "1px dashed var(--cl-border)" }}>
              <div style={{ background: "var(--cl-bg-subtle)", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--sp-lg) auto" }}>
                <FileText size={32} color="var(--cl-text-muted)" />
              </div>
              <div className="empty-state-title" style={{ fontSize: "var(--fs-2xl)", fontWeight: "var(--fw-bold)", marginBottom: "var(--sp-xs)" }}>
                {query ? "No matching documents" : "Your vault is empty"}
              </div>
              <p style={{ color: "var(--cl-text-muted)", fontSize: "var(--fs-lg)", maxWidth: "400px", margin: "0 auto" }}>
                {query ? "Try adjusting your search terms." : "Upload important travel documents to keep them safe and accessible."}
              </p>
            </div>
          ) : (
            <div className="doc-grid">
              {filtered.map((doc) => (
                <article key={doc.id} className="doc-row card-hover">
                  <div className="doc-row-icon">
                    <FileType size={22} />
                  </div>

                  <div className="doc-row-main">
                    <h3 className="doc-row-title" title={doc.fileName}>{doc.fileName}</h3>

                    <div className="doc-row-meta">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", textTransform: "capitalize" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cl-accent)", flexShrink: 0 }} />
                        {doc.documentType}
                      </span>

                      {doc.expiresAt && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: new Date(doc.expiresAt) < new Date() ? "var(--cl-error)" : "var(--cl-text-muted)" }}>
                          <Calendar size={14} /> Expires {formatDate(doc.expiresAt)}
                        </span>
                      )}

                      <span>{(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>

                    {doc.caption ? <p className="doc-row-caption">{doc.caption}</p> : null}
                  </div>

                  <div className="doc-row-actions">
                    <a className="btn btn-secondary btn-icon" href={doc.cloudinaryUrl} target="_blank" rel="noreferrer" title="Download">
                      <Download size={18} />
                    </a>
                    <button type="button" className="btn btn-ghost btn-icon" onClick={() => window.confirm(`Delete ${doc.fileName}?`) && deleteMutation.mutate(doc.id)} style={{ color: "var(--cl-error)" }} title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ── Upload Sidebar ────────────────────────────── */}
        <div className="trip-docs-sidebar">
          <div className="card trip-docs-upload-card">
            <h3 style={{ fontSize: "var(--fs-lg)", margin: "0 0 var(--sp-md) 0", display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}>
              <Upload size={20} color="var(--cl-accent)" /> Add Document
            </h3>

            <div 
              className={`doc-dropzone ${dragging ? "active" : ""}`} 
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }} 
              onDragLeave={() => setDragging(false)} 
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFileSelect(e.dataTransfer.files?.[0]); }}
              style={{ 
                border: selectedFile ? "1px solid var(--cl-teal)" : dragging ? "2px dashed var(--cl-accent)" : "2px dashed var(--cl-border)",
                background: selectedFile ? "rgba(42, 157, 143, 0.05)" : dragging ? "rgba(224, 122, 95, 0.05)" : "var(--cl-bg-subtle)",
                padding: "var(--sp-2xl) var(--sp-lg)",
                borderRadius: "var(--br-lg)",
                textAlign: "center",
                transition: "all var(--tr-fast)",
                marginBottom: "var(--sp-lg)",
                position: "relative"
              }}
            >
              {selectedFile ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-sm)" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--cl-teal)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--sp-xs)" }}>
                    <CheckCircle size={24} />
                  </div>
                  <div style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", color: "var(--cl-text)", wordBreak: "break-all" }}>{selectedFile.name}</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--cl-text-muted)" }}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={() => setSelectedFile(null)} style={{ position: "relative", zIndex: 10, marginTop: "var(--sp-sm)" }}>Choose different file</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--sp-sm)", pointerEvents: "none" }}>
                  <Upload size={32} color={dragging ? "var(--cl-accent)" : "var(--cl-text-muted)"} style={{ marginBottom: "var(--sp-xs)" }} />
                  <div style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)" }}>Drag & Drop</div>
                  <div style={{ fontSize: "var(--fs-xs)", color: "var(--cl-text-muted)", lineHeight: 1.5 }}>PDF, images, or text files<br />Up to 25 MB</div>
                </div>
              )}
              
              {!selectedFile && (
                <input type="file" accept=".pdf,image/png,image/jpeg,image/webp,text/plain" onChange={(e) => handleFileSelect(e.target.files?.[0])} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} title="Choose file" />
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-md)" }}>
              <div className="input-wrap">
                <label className="input-label">Document Type</label>
                <select className="input" value={draft.documentType} onChange={(e) => setDraft((v) => ({ ...v, documentType: e.target.value }))}>
                  {documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              
              <div className="input-wrap">
                <label className="input-label">Expiry Date (Optional)</label>
                <div style={{ position: "relative" }}>
                  <Calendar size={16} color="var(--cl-text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="input" type="date" value={draft.expiresAt} onChange={(e) => setDraft((v) => ({ ...v, expiresAt: e.target.value }))} style={{ paddingLeft: "36px" }} />
                </div>
              </div>
              
              <div className="input-wrap">
                <label className="input-label">Notes & PNR (Optional)</label>
                <textarea className="input" value={draft.caption} onChange={(e) => setDraft((v) => ({ ...v, caption: e.target.value }))} placeholder="e.g. Booking Ref: XYZ123" rows={2} style={{ resize: "none" }} />
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: "100%", marginTop: "var(--sp-xs)", padding: "var(--sp-md)", fontSize: "var(--fs-md)" }} 
                disabled={!selectedFile || uploadMutation.isPending}
                onClick={submitUpload}
              >
                {uploadMutation.isPending ? "Uploading Securely..." : "Save Document"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
