import { apiClient, unwrap } from "./client";
export async function generateItinerary(body) {
    const res = await apiClient.post(`/ai/itinerary`, body);
    return unwrap(res);
}
export async function generatePackingList(tripId) {
    const res = await apiClient.post(`/ai/packing`, {
        tripId
    });
    return unwrap(res);
}
export async function estimateBudgetForTrip(tripId) {
    const res = await apiClient.post(`/ai/budget-estimate`, {
        tripId
    });
    return unwrap(res);
}
