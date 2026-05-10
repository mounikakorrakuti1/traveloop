import { apiClient, unwrap } from "./client";
export async function listPackingItems(tripId) {
    const res = await apiClient.get(`/trips/${tripId}/packing-items`);
    return unwrap(res);
}
export async function createPackingItem(tripId, body) {
    const res = await apiClient.post(`/trips/${tripId}/packing-items`, body);
    return unwrap(res);
}
export async function updatePackingItem(tripId, itemId, body) {
    const res = await apiClient.put(`/trips/${tripId}/packing-items/${itemId}`, body);
    return unwrap(res);
}
