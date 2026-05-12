import { apiClient, unwrap } from "./client";

export async function generateItinerary(body) {
    const res = await apiClient.post("/ai/itinerary", body);
    return unwrap(res);
}
export async function generateTripPlan(body) {
    const res = await apiClient.post("/ai/trip-plan", body);
    return unwrap(res);
}
export async function generatePackingList(body) {
    const res = await apiClient.post("/ai/packing", body);
    return unwrap(res);
}
export async function estimateBudget(body) {
    const res = await apiClient.post("/ai/budget-estimate", body);
    return unwrap(res);
}
