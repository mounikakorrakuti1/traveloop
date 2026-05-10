import { apiClient, unwrap, unwrapPaginated } from "./client";
export async function listTrips(filters) {
    const res = await apiClient.get(`/trips`, {
        params: filters
    });
    const { items, meta } = unwrapPaginated(res);
    return {
        trips: items,
        meta
    };
}
export async function getTrip(id) {
    const res = await apiClient.get(`/trips/${id}`);
    return unwrap(res);
}
export async function createTrip(body) {
    const res = await apiClient.post(`/trips`, body);
    return unwrap(res);
}
export async function updateTrip(id, body) {
    const res = await apiClient.put(`/trips/${id}`, body);
    return unwrap(res);
}
export async function deleteTrip(id) {
    await apiClient.delete(`/trips/${id}`);
}
export async function getBudgetSummary(tripId) {
    const res = await apiClient.get(`/trips/${tripId}/budget`);
    return unwrap(res);
}
export async function publishTrip(tripId) {
    const res = await apiClient.post(`/trips/${tripId}/publish`);
    return unwrap(res);
}
