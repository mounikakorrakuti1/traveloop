import { BUDGET_USD_LOOKS_LIKE_INR_THRESHOLD, usdToInr } from "@/lib/currency";

export function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function usd(value) {
  const n = Number(value ?? 0);
  return `INR ${Number.isFinite(n) ? n.toLocaleString("en-IN") : "0"}`;
}

export function getTripBudget(trip) {
  if (trip?.budgetCapInr != null && trip.budgetCapInr !== "") {
    const legacy = Number(trip.budgetCapInr);
    if (Number.isFinite(legacy) && legacy > 0) return legacy;
  }
  if (trip?.budgetCapUsd != null && trip.budgetCapUsd !== "") {
    const raw = Number(trip.budgetCapUsd);
    if (Number.isFinite(raw) && raw > 0) {
      if (raw >= BUDGET_USD_LOOKS_LIKE_INR_THRESHOLD) return Math.round(raw);
      return usdToInr(raw);
    }
  }
  return Number(trip?.budget ?? 0);
}

export function getCityLabel(city) {
  if (!city) return "Unknown city";
  return [city.name, city.state, city.country].filter(Boolean).join(", ");
}

export function getStopCity(stop) {
  return stop?.city ?? stop?.City ?? null;
}

/** Activities API returns `estimatedCostUsd`; UI historically used INR. */
export function activityEstimatedInr(activity) {
  if (!activity) return 0;
  if (activity.estimatedCostInr != null && activity.estimatedCostInr !== "") {
    const n = Number(activity.estimatedCostInr);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return usdToInr(activity.estimatedCostUsd);
}
