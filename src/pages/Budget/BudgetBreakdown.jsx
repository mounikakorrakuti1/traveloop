import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getTrip } from "@/api/trips.api";
import { estimateBudget } from "@/api/ai.api";
import { getApiErrorMessage } from "@/api/client";
import { QUERY_KEYS } from "@/lib/constants";
import { getCityLabel, getStopCity, usd } from "@/lib/format";
import { useBudget } from "@/hooks/useBudget";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAuthStore } from "@/store/authStore";
import { buildAiContext } from "@/lib/aiContext";
import { updateProfile } from "@/api/auth.api";
import { AiThinkingPanel } from "@/components/ai/AiThinkingPanel";
import { useToast } from "@/components/shared/toast-context";
import "@/styles/components/budget.css";
import "@/styles/components/ui.css";
import { AlertTriangle, Banknote, BedDouble, Bus, CircleDollarSign, Coffee, Landmark, Lightbulb, Sparkles, WalletCards } from "lucide-react";

const numberValue = (...values) => {
  const value = values.find((item) => typeof item === "number" && Number.isFinite(item));
  return value ?? 0;
};

const maybeNumberValue = (...values) => {
  const value = values.find((item) => typeof item === "number" && Number.isFinite(item));
  return value ?? null;
};

const titleCase = (value) => String(value || "Other").replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

function normalizeAiBudget(data) {
  if (!data) return null;
  const accommodation = numberValue(data.accommodationInr, data.accommodationUsd);
  const food = numberValue(data.foodInr, data.foodUsd);
  const transport = numberValue(data.transportInr, data.transportUsd);
  const activities = numberValue(data.activitiesInr, data.activitiesUsd);
  return {
    cityName: data.cityName,
    currency: data.currency || "INR",
    perDay: numberValue(data.perDayInr, data.perDayUsd, accommodation + food + transport + activities),
    accommodation,
    food,
    transport,
    activities,
    confidence: data.confidence || "ai",
    notes: Array.isArray(data.notes) ? data.notes : [],
  };
}

export default function BudgetBreakdownPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const { requestLocation, isLocating } = useGeolocation();
  const { data: trip } = useQuery({ queryKey: QUERY_KEYS.trip(id ?? ""), queryFn: () => getTrip(id), enabled: Boolean(id) });
  const { data: budget, isLoading, isError } = useBudget(id);
  const stops = trip?.stops ?? [];
  const firstCity = getStopCity(stops[0]);
  const tripDays = stops.length || (trip?.startDate && trip?.endDate ? Math.max(1, Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000) + 1) : 1);

  const aiMutation = useMutation({
    mutationFn: async () => {
      if (!firstCity) throw new Error("Add at least one itinerary stop before requesting an AI budget estimate.");
      const coords = await requestLocation();
      if (coords) {
        await updateProfile({
          travelPreferences: {
            ...(user?.travelPreferences || {}),
            currentLocation: coords,
            locationCapturedAt: new Date().toISOString(),
          },
        }).catch(() => {});
      }
      return estimateBudget({
        cityId: firstCity.id,
        cityName: getCityLabel(firstCity),
        vibe: trip?.vibe || "comfort",
        tripType: trip?.tripType || "solo",
        days: tripDays,
        userContext: buildAiContext(user, {
          currentLocation: coords || undefined,
          groupSize: trip?.tripType === "group" ? 4 : 1,
        }),
      });
    },
    onError: (err) => showToast(getApiErrorMessage(err), "error"),
  });

  const totalCap = maybeNumberValue(budget?.totalBudgetCapInr, budget?.totalBudgetCapUsd);
  const spent = numberValue(budget?.totalSpentInr, budget?.totalSpentUsd);
  const remaining = maybeNumberValue(budget?.remainingInr, budget?.remainingUsd);
  const pct = totalCap > 0 ? Math.min(Math.round((spent / totalCap) * 100), 100) : 0;
  const aiBudget = normalizeAiBudget(aiMutation.data);
  const byDay = budget?.byDay ?? [];
  const byCategory = budget?.byCategory ?? [];
  const projectedTripTotal = aiBudget ? aiBudget.perDay * tripDays : null;

  return (
    <div className="budget-root">
      <div className="budget-header">
        <div>
          <h1 className="budget-title">Budget Breakdown</h1>
          <p className="budget-subtitle">{trip?.title || "Trip"}{firstCity ? ` - first stop ${getCityLabel(firstCity)}` : ""}</p>
        </div>
        <button className="btn btn-primary" disabled={!firstCity || aiMutation.isPending || isLocating} onClick={() => aiMutation.mutate()}><Sparkles size={16} /> {isLocating ? "Locating..." : aiMutation.isPending ? "Estimating..." : "AI Estimate"}</button>
      </div>

      {(aiMutation.isPending || isLocating) && (
        <AiThinkingPanel
          title="Estimating realistic trip costs"
          destination={firstCity ? getCityLabel(firstCity) : trip?.title || "your trip"}
        />
      )}

      {isLoading ? <div className="empty-state">Loading budget...</div> : isError ? (
        <div className="empty-state"><AlertTriangle size={32} /> Unable to load budget.</div>
      ) : (
        <>
          <div className="budget-summary-grid">
            <div className="budget-invoice-card">
              <div className="invoice-trip-meta">
                <div className="invoice-logo" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><WalletCards size={32} /></div>
                <div>
                  <div className="invoice-trip-name">{trip?.title || "Trip Budget"}</div>
                  <div className="invoice-trip-dates">{budget?.isOverBudget ? "Over budget" : totalCap ? "Within budget" : "No cap set"}</div>
                  <div className="budget-progress"><span style={{ width: `${pct}%` }} /></div>
                </div>
                <div>
                  <div className="invoice-meta-label">Spent</div>
                  <div className="invoice-meta-value">{usd(spent)}</div>
                </div>
              </div>
            </div>

            <div className="budget-insight-card">
              <h3 className="budget-insight-title" style={{ display: "flex", alignItems: "center", gap: "var(--sp-xs)" }}><Lightbulb size={18} color="var(--cl-warm)" /> Budget Insights</h3>
              <div className="budget-ring-legend">
                <div className="budget-legend-item"><span className="legend-label">Total Budget</span><span className="legend-value">{totalCap ? usd(totalCap) : "Not set"}</span></div>
                <div className="budget-legend-item"><span className="legend-label">Spent</span><span className="legend-value" style={{ color: "var(--cl-accent)" }}>{usd(spent)}</span></div>
                <div className="budget-legend-item"><span className="legend-label">Remaining</span><span className="legend-value" style={{ color: "var(--cl-teal)" }}>{remaining == null ? "No cap" : usd(remaining)}</span></div>
                <div className="budget-legend-item"><span className="legend-label">Used</span><span className="legend-value">{pct}%</span></div>
              </div>
            </div>
          </div>

          {aiBudget && !aiMutation.isPending && (
            <div className="budget-ai-result">
              <div className="budget-ai-main">
                <div className="budget-ai-kicker">AI daily estimate</div>
                <h2>{usd(aiBudget.perDay)} / day in {aiBudget.cityName}</h2>
                <p>Projected {tripDays}-day spend: <strong>{usd(projectedTripTotal)}</strong>. Use this as a planning baseline before exact bookings.</p>
              </div>
              <div className="budget-ai-split">
                <div><BedDouble size={18} /><span>Stay</span><strong>{usd(aiBudget.accommodation)}</strong></div>
                <div><Coffee size={18} /><span>Food</span><strong>{usd(aiBudget.food)}</strong></div>
                <div><Bus size={18} /><span>Transport</span><strong>{usd(aiBudget.transport)}</strong></div>
                <div><Landmark size={18} /><span>Activities</span><strong>{usd(aiBudget.activities)}</strong></div>
              </div>
              {aiBudget.notes.length > 0 && (
                <div className="budget-ai-notes">
                  {aiBudget.notes.map((note) => <p key={note}>{note}</p>)}
                </div>
              )}
            </div>
          )}

          <div className="budget-table-wrap">
            <table className="budget-table">
              <thead><tr><th>Date</th><th>City</th><th>Accommodation</th><th>Activities</th><th>Total</th></tr></thead>
              <tbody>
                {byDay.length === 0 && (
                  <tr>
                    <td colSpan={5} className="budget-empty-cell">No spend yet. Add accommodation costs and activities from itinerary stops.</td>
                  </tr>
                )}
                {byDay.map((row) => (
                  <tr key={row.stopId}>
                    <td>{row.date}</td>
                    <td>{row.cityName}</td>
                    <td>{usd(numberValue(row.accommodationCostInr, row.accommodationCostUsd))}</td>
                    <td>{usd(numberValue(row.activitiesCostInr, row.activitiesCostUsd))}</td>
                    <td>{usd(numberValue(row.totalInr, row.totalUsd))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="budget-category-grid">
            {byCategory.length === 0 && (
              <div className="budget-category-card">
                <CircleDollarSign size={18} />
                <h3>No categories yet</h3>
                <p>Costs will group here after itinerary spend exists.</p>
              </div>
            )}
            {byCategory.map((row) => (
              <div className="budget-category-card" key={row.category}>
                <Banknote size={18} />
                <h3>{titleCase(row.category)}</h3>
                <p>{usd(numberValue(row.totalInr, row.totalUsd))}</p>
                <span>{row.percentage}% of spend</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
