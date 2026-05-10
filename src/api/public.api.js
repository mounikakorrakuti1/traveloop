import { apiClient, unwrap } from "./client";
export async function getPublicTrip(slug) {
    const res = await apiClient.get(`/public/trips/${slug}`);
    return unwrap(res);
}
export async function copyPublicTrip(slug) {
    const res = await apiClient.post(`/public/trips/${slug}/copy`);
    return unwrap(res);
}
