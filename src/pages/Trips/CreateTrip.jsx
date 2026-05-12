import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createTrip } from "@/api/trips.api";
import { getApiErrorMessage } from "@/api/client";
import { ROUTES } from "@/lib/constants";
import { inrToUsd } from "@/lib/currency";
import "@/styles/components/ui.css";
import "@/styles/components/create-trip.css";
import { Rocket, AlertTriangle, X } from "lucide-react";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    coverPhotoUrl: "",
    startDate: "",
    endDate: "",
    tripType: "solo",
    budgetCapInr: "",
    vibe: "comfort",
  });

  const mutation = useMutation({
    mutationFn: createTrip,
    onSuccess: (trip) => navigate(ROUTES.tripDetail(trip.id), { replace: true }),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Trip name is required.");
    if (!form.startDate || !form.endDate) return setError("Start and end dates are required.");
    if (form.endDate < form.startDate) return setError("End date must be on or after the start date.");

    const urlPattern = /^(https?:\/\/)/;
    if (form.coverPhotoUrl && !urlPattern.test(form.coverPhotoUrl)) {
      return setError("Please enter a valid URL (starting with http or https) or leave it empty.");
    }

    const budgetCapUsd =
      form.budgetCapInr === "" ? undefined : inrToUsd(form.budgetCapInr);
    mutation.mutate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      coverPhotoUrl: form.coverPhotoUrl.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      tripType: form.tripType,
      ...(budgetCapUsd != null ? { budgetCapUsd } : {}),
      vibe: form.vibe,
    });
  };

  const bypass = () => {
    // For development: Skip backend and go to list
    navigate(ROUTES.trips);
  };

  return (
    <div className="create-trip-root">
      <div className="create-trip-form-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--sp-lg)" }}>
          <div>
            <h1 className="create-trip-title">Plan a New Trip</h1>
            <p className="create-trip-sub">Set your destination shell and timing to unlock AI planning.</p>
          </div>
          <Link to={ROUTES.trips} style={{ color: "var(--cl-text-muted)", padding: "var(--sp-xs)" }}><X size={24} /></Link>
        </div>

        {error && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "var(--br-xl)", padding: "var(--sp-sm) var(--sp-md)", marginBottom: "var(--sp-xl)" }}>
            <div className="input-error-msg" style={{ display: "flex", gap: "var(--sp-xs)", margin: 0, alignItems: "center" }}>
              <AlertTriangle size={16} /> {error}
            </div>
            <button type="button" onClick={bypass} className="btn btn-sm btn-ghost" style={{ fontSize: "var(--fs-xs)", color: "var(--cl-accent)" }}>
              Skip →
            </button>
          </div>
        )}

        <form className="create-trip-fields" onSubmit={submit}>
          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-title">Trip Title</label>
            <input id="ct-title" className="input" autoFocus value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g., Summer in Rajasthan" />
          </div>

          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-description">Quick Notes (Optional)</label>
            <textarea id="ct-description" className="input" rows={2} style={{ minHeight: "80px" }} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What's the vibe of this trip?" />
          </div>

          <div className="create-trip-row">
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-start">Departure</label>
              <input id="ct-start" type="date" className="input" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
            </div>
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-end">Return</label>
              <input id="ct-end" type="date" className="input" value={form.endDate} min={form.startDate} onChange={(e) => update("endDate", e.target.value)} />
            </div>
          </div>

          <div className="create-trip-row">
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-type">Trip Category</label>
              <select id="ct-type" className="input" value={form.tripType} onChange={(e) => update("tripType", e.target.value)}>
                {["solo", "couple", "family", "group", "adventure", "pilgrimage", "honeymoon", "business"].map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
            <div className="input-wrap">
              <label className="input-label" htmlFor="ct-vibe">Budget Preference</label>
              <select id="ct-vibe" className="input" value={form.vibe} onChange={(e) => update("vibe", e.target.value)}>
                {["backpacker", "comfort", "luxury"].map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="input-wrap">
            <label className="input-label" htmlFor="ct-budget">Estimated Budget Cap (₹)</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "var(--sp-md)", top: "50%", transform: "translateY(-50%)", color: "var(--cl-text-muted)", fontWeight: "bold" }}>₹</span>
              <input id="ct-budget" type="number" min="0" className="input" style={{ paddingLeft: "var(--sp-xl)" }} value={form.budgetCapInr} onChange={(e) => update("budgetCapInr", e.target.value)} placeholder="e.g., 50000" />
            </div>
          </div>

          <div className="create-trip-actions">
            <Link to={ROUTES.trips} className="create-trip-btn-secondary">Cancel</Link>
            <button type="submit" className="create-trip-btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : <>Create Itinerary <Rocket size={20} /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
