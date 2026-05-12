import axios from "axios";
import { apiClient, unwrap } from "./client";

const AI_VIBES = new Set([
    "backpacker",
    "comfort",
    "luxury"
]);
const AI_TRIP_TYPES = new Set([
    "solo",
    "couple",
    "family",
    "group",
    "adventure",
    "pilgrimage",
    "honeymoon",
    "business"
]);

/** Align trip fields with backend `itineraryDto` enums so validation does not fail silently. */
export function sanitizeAiTripFields(trip) {
    const vibe = trip?.vibe && AI_VIBES.has(trip.vibe) ? trip.vibe : "comfort";
    const tripType = trip?.tripType && AI_TRIP_TYPES.has(trip.tripType) ? trip.tripType : "solo";
    return {
        vibe,
        tripType
    };
}

/** Gemini may omit `stops`; keep UI from hiding the whole panel. */
export function normalizeGeneratedItinerary(data) {
    if (!data || typeof data !== "object") {
        return {
            stops: [],
            summary: "",
            routeStrategy: "",
            timingTips: []
        };
    }
    return {
        ...data,
        stops: Array.isArray(data.stops) ? data.stops : [],
        timingTips: Array.isArray(data.timingTips) ? data.timingTips : []
    };
}

function buildSanitizedPreferences(input) {
    if (!input.preferences || typeof input.preferences !== "object") {
        return null;
    }
    const p = input.preferences;
    const pref = {};
    if (typeof p.source === "string" && p.source.trim()) {
        pref.source = p.source.trim().slice(0, 120);
    }
    if (typeof p.destination === "string" && p.destination.trim()) {
        pref.destination = p.destination.trim().slice(0, 160);
    }
    if (typeof p.startDate === "string" && p.startDate.trim()) {
        pref.startDate = p.startDate.trim().slice(0, 40);
    }
    if (typeof p.endDate === "string" && p.endDate.trim()) {
        pref.endDate = p.endDate.trim().slice(0, 40);
    }
    if (Array.isArray(p.placesToCover) && p.placesToCover.length > 0) {
        pref.placesToCover = p.placesToCover
            .slice(0, 30)
            .map((x) => String(x ?? "").trim().slice(0, 120))
            .filter(Boolean);
    }
    if (typeof p.stayPreference === "string" && p.stayPreference.trim()) {
        pref.stayPreference = p.stayPreference.trim().slice(0, 80);
    }
    if (Array.isArray(p.transportationPreferences) && p.transportationPreferences.length > 0) {
        pref.transportationPreferences = p.transportationPreferences
            .slice(0, 8)
            .map((x) => String(x ?? "").trim().slice(0, 40))
            .filter(Boolean);
    }
    if (typeof p.specificDateTimePreferences === "string" && p.specificDateTimePreferences.trim()) {
        pref.specificDateTimePreferences = p.specificDateTimePreferences.trim().slice(0, 500);
    }
    if (typeof p.foodPreference === "string" && p.foodPreference.trim()) {
        pref.foodPreference = p.foodPreference.trim().slice(0, 80);
    }
    if (typeof p.budgetInr === "number" && Number.isFinite(p.budgetInr) && p.budgetInr >= 0) {
        pref.budgetInr = Math.round(p.budgetInr);
    }
    return Object.keys(pref).length > 0 ? pref : null;
}

function buildSanitizedUserContext(input) {
    if (!input.userContext || typeof input.userContext !== "object") {
        return null;
    }
    const u = input.userContext;
    const ctx = {};
    if (Array.isArray(u.travelStyle) && u.travelStyle.length > 0) {
        const travelStyle = u.travelStyle
            .slice(0, 12)
            .map((x) => String(x).trim().slice(0, 40))
            .filter(Boolean);
        if (travelStyle.length > 0) {
            ctx.travelStyle = travelStyle;
        }
    }
    if (Array.isArray(u.interests) && u.interests.length > 0) {
        ctx.interests = u.interests
            .slice(0, 20)
            .map((x) => String(x).trim().slice(0, 50))
            .filter(Boolean);
    }
    const budget = {};
    if (typeof u.budget?.min === "number" && Number.isFinite(u.budget.min) && u.budget.min >= 0) {
        budget.min = u.budget.min;
    }
    if (typeof u.budget?.max === "number" && Number.isFinite(u.budget.max) && u.budget.max >= 0) {
        budget.max = u.budget.max;
    }
    if (typeof u.budget?.currency === "string" && u.budget.currency.trim()) {
        budget.currency = u.budget.currency.trim().slice(0, 10);
    }
    if (Object.keys(budget).length > 0) {
        ctx.budget = budget;
    }
    if (typeof u.foodPreference === "string" && u.foodPreference.trim()) {
        ctx.foodPreference = u.foodPreference.trim().slice(0, 80);
    }
    if (typeof u.climatePreference === "string" && u.climatePreference.trim()) {
        ctx.climatePreference = u.climatePreference.trim().slice(0, 80);
    }
    if (Array.isArray(u.previousTrips) && u.previousTrips.length > 0) {
        ctx.previousTrips = u.previousTrips
            .slice(0, 10)
            .map((x) => String(x).trim().slice(0, 120))
            .filter(Boolean);
    }
    if (typeof u.groupSize === "number" && Number.isFinite(u.groupSize)) {
        const g = Math.round(u.groupSize);
        if (g >= 1 && g <= 30) {
            ctx.groupSize = g;
        }
    }
    const loc = u.currentLocation;
    if (loc && typeof loc === "object") {
        const lat = Number(loc.latitude);
        const lng = Number(loc.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            ctx.currentLocation = { latitude: lat, longitude: lng };
            if (typeof loc.city === "string" && loc.city.trim()) {
                ctx.currentLocation.city = loc.city.trim().slice(0, 80);
            }
            if (typeof loc.country === "string" && loc.country.trim()) {
                ctx.currentLocation.country = loc.country.trim().slice(0, 80);
            }
        }
    }
    return Object.keys(ctx).length > 0 ? ctx : null;
}

/** Older APIs reject `preferences` / `userContext` on strict schemas — fold into prompt. */
function foldPlannerIntoPrompt(basePrompt, preferences, userContext) {
    const lines = [];
    if (preferences) {
        if (preferences.source) lines.push(`From: ${preferences.source}`);
        if (preferences.destination) lines.push(`Destination: ${preferences.destination}`);
        if (preferences.startDate || preferences.endDate) {
            lines.push(`Dates: ${preferences.startDate ?? "?"} to ${preferences.endDate ?? "?"}`);
        }
        if (preferences.placesToCover?.length) {
            lines.push(`Places: ${preferences.placesToCover.join(", ")}`);
        }
        if (preferences.stayPreference) lines.push(`Stay: ${preferences.stayPreference}`);
        if (preferences.transportationPreferences?.length) {
            lines.push(`Transport: ${preferences.transportationPreferences.join(", ")}`);
        }
        if (preferences.specificDateTimePreferences) {
            lines.push(`Timing: ${preferences.specificDateTimePreferences}`);
        }
        if (preferences.foodPreference) lines.push(`Food: ${preferences.foodPreference}`);
        if (preferences.budgetInr != null) lines.push(`Budget cap (INR): ${preferences.budgetInr}`);
    }
    if (userContext) {
        if (userContext.travelStyle?.length) lines.push(`Styles: ${userContext.travelStyle.join(", ")}`);
        if (userContext.interests?.length) lines.push(`Interests: ${userContext.interests.join(", ")}`);
        if (userContext.budget && (userContext.budget.min != null || userContext.budget.max != null)) {
            lines.push(
                `Budget prefs: ${userContext.budget.min ?? "?"}–${userContext.budget.max ?? "?"} ${userContext.budget.currency ?? ""}`.trim()
            );
        }
        if (userContext.foodPreference) lines.push(`Traveler food: ${userContext.foodPreference}`);
        if (userContext.climatePreference) lines.push(`Climate: ${userContext.climatePreference}`);
        if (userContext.previousTrips?.length) {
            lines.push(`Prior stops: ${userContext.previousTrips.join(", ")}`);
        }
        if (userContext.groupSize != null) lines.push(`Group size: ${userContext.groupSize}`);
        const loc = userContext.currentLocation;
        if (loc && Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude)) {
            const place = [loc.city, loc.country].filter(Boolean).join(", ");
            lines.push(
                place
                    ? `Near: ${place} (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`
                    : `Near: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`
            );
        }
    }
    if (lines.length === 0) {
        return basePrompt.slice(0, 2000);
    }
    const suffix = `\n\nPlanner context:\n${lines.join("\n")}`;
    return (basePrompt + suffix).slice(0, 2000);
}

/**
 * Match backend `itineraryDto` — omit nulls, clamp lengths and `days`.
 * @param {{ includePlannerFields?: boolean }} [options] If false, only `prompt`, `days`, `vibe`, `tripType` (legacy `/ai/itinerary`).
 */
export function prepareItineraryAiRequest(body, options = {}) {
    const { includePlannerFields = true } = options;
    const input = body && typeof body === "object" ? body : {};
    const { vibe, tripType } = sanitizeAiTripFields(input);

    const daysRaw = Number(input.days);
    const days = Number.isFinite(daysRaw)
        ? Math.min(30, Math.max(1, Math.round(daysRaw)))
        : 1;

    const rawPrompt = String(input.prompt ?? "").trim();
    const basePrompt = rawPrompt.length > 0 ? rawPrompt : "Trip";

    const preferences = buildSanitizedPreferences(input);
    const userContext = buildSanitizedUserContext(input);

    if (!includePlannerFields) {
        return {
            prompt: foldPlannerIntoPrompt(basePrompt, preferences, userContext),
            days,
            vibe,
            tripType
        };
    }

    const out = {
        prompt: basePrompt.slice(0, 2000),
        days,
        vibe,
        tripType
    };
    if (preferences) {
        out.preferences = preferences;
    }
    if (userContext) {
        out.userContext = userContext;
    }
    return out;
}

export async function generateItinerary(body) {
    const res = await apiClient.post(
        "/ai/itinerary",
        prepareItineraryAiRequest(body, { includePlannerFields: false })
    );
    return unwrap(res);
}
export async function generateTripPlan(body) {
    const res = await apiClient.post("/ai/trip-plan", prepareItineraryAiRequest(body, { includePlannerFields: true }));
    return unwrap(res);
}

function isStrictBodyValidationError(err) {
    if (!axios.isAxiosError(err) || err.response?.status !== 400) return false;
    const data = err.response?.data;
    const parts = [typeof data?.error === "string" ? data.error : ""];
    const det = data?.details;
    if (det && typeof det === "object") {
        for (const v of Object.values(det)) {
            if (Array.isArray(v)) {
                parts.push(...v.filter((x) => typeof x === "string"));
            }
        }
    }
    const msg = parts.join(" ");
    return /unrecognized key/i.test(msg);
}

/**
 * Prefer enriched trip-plan; fall back to `/ai/itinerary` when the server is older
 * or `trip-plan` is not deployed (404). Retries trip-plan without planner fields if strict schema rejects them.
 */
export async function generateTripPlanWithFallback(body) {
    try {
        return await generateTripPlan(body);
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
            return generateItinerary(body);
        }
        if (isStrictBodyValidationError(err)) {
            try {
                return await generateTripPlan(prepareItineraryAiRequest(body, { includePlannerFields: false }));
            } catch {
                return generateItinerary(body);
            }
        }
        throw err;
    }
}
export async function generatePackingList(body) {
    const res = await apiClient.post("/ai/packing", body);
    return unwrap(res);
}
export async function estimateBudget(body) {
    const res = await apiClient.post("/ai/budget-estimate", body);
    return unwrap(res);
}
