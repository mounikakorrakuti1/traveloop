import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";
import "@/styles/components/ui.css";

export function Modal({ open, title, children, onClose, closeDisabled = false }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (e) => {
      if (closeDisabled) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose, closeDisabled]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal="true"
      style={{
        width: "min(100% - 2rem, 32rem)",
        borderRadius: "var(--br-2xl)",
        border: "1px solid var(--cl-border)",
        background: "var(--cl-bg)",
        padding: 0,
        boxShadow: "var(--shadow-2xl)",
        outline: "none",
        color: "var(--cl-text)",
        overflow: "hidden",
      }}
      className="modal-dialog"
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--sp-md) var(--sp-lg)",
        borderBottom: "1px solid var(--cl-border)",
        background: "var(--cl-bg-alt)",
      }}>
        <h2 id={titleId} style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-md)", fontWeight: "var(--fw-bold)", margin: 0 }}>
          {title}
        </h2>
        <Button 
          variant="ghost" 
          onClick={onClose} 
          disabled={closeDisabled}
          style={{ fontSize: "1.5rem", padding: "0 var(--sp-sm)" }}
        >
          ×
        </Button>
      </div>
      <div style={{ padding: "var(--sp-lg)" }}>
        {children}
      </div>
    </dialog>
  );
}
