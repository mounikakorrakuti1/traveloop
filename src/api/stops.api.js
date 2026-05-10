import { apiClient, unwrap } from "./client";
export async function listStops(tripId) {
    const res = await apiClient.get(`/trips/${tripId}/stops`);
    return unwrap(res);
}
export async function createStop(tripId, body) {
    const res = await apiClient.post(`/trips/${tripId}/stops`, body);
    return unwrap(res);
}
export async function updateStop(tripId, stopId, body) {
    const res = await apiClient.put(`/trips/${tripId}/stops/${stopId}`, body);
    return unwrap(res);
}
export async function deleteStop(tripId, stopId) {
    await apiClient.delete(`/trips/${tripId}/stops/${stopId}`);
}
export async function reorderStops(tripId, stopOrders) {
    const res = await apiClient.put(`/trips/${tripId}/stops/reorder`, {
        stopOrders
    });
    return unwrap(res);
}
