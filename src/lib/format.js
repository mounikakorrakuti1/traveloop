export function formatDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function usd(value) {
  const n = Number(value ?? 0);
  return `INR ${Number.isFinite(n) ? n.toLocaleString("en-IN") : "0"}`;
}

export function getTripBudget(trip) {
  return Number(trip?.budgetCapInr ?? trip?.budget ?? 0);
}

export function getCityLabel(city) {
  if (!city) return "Unknown city";
  return [city.name, city.state, city.country].filter(Boolean).join(", ");
}

export function getStopCity(stop) {
  return stop?.city ?? stop?.City ?? null;
}
