import { apiClient, unwrap } from "./client";
export async function signUpload() {
    const res = await apiClient.post(`/media/sign`, {});
    return unwrap(res);
}
export async function listMedia(tripId) {
    const res = await apiClient.get(`/trips/${tripId}/media`);
    return unwrap(res);
}
/** DELETE may be 204 No Content — playbook §1.3 */ export async function deleteMedia(tripId, mediaId) {
    await apiClient.delete(`/trips/${tripId}/media/${mediaId}`);
}
