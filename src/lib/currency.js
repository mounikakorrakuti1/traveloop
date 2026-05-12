/** Approximate display conversion when the API stores caps in USD. */
export const APPROX_INR_PER_USD = 83;

/**
 * Showcase / legacy rows sometimes stored an INR cap in `budgetCapUsd`.
 * Above this threshold, treat the number as INR for display (not ×83).
 */
export const BUDGET_USD_LOOKS_LIKE_INR_THRESHOLD = 12_000;

export function inrToUsd(inr) {
  const n = Number(inr);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.round((n / APPROX_INR_PER_USD) * 100) / 100;
}

export function usdToInr(usdAmount) {
  const n = Number(usdAmount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * APPROX_INR_PER_USD);
}
