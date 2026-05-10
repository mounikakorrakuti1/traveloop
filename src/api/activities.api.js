import { apiClient, unwrap, unwrapPaginated } from "./client";
export async function searchActivities(params) {
    const res = await apiClient.get(`/activities`, {
        params
    });
    const { items, meta } = unwrapPaginated(res);
    return {
        activities: items,
        meta
    };
}
export async function assignActivityToStop(tripId, stopId, activityId) {
    const res = await apiClient.post(`/trips/${tripId}/stops/${stopId}/activities`, {
        activityId
    });
    return unwrap(res);
}
export async function removeActivityFromStop(tripId, stopId, stopActivityId) {
    await apiClient.delete(`/trips/${tripId}/stops/${stopId}/activities/${stopActivityId}`);
}
