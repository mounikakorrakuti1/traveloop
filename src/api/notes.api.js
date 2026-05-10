import { apiClient, unwrap, unwrapPaginated } from "./client";
export async function listNotes(tripId) {
    const res = await apiClient.get(`/trips/${tripId}/notes`);
    const { items, meta } = unwrapPaginated(res);
    return {
        notes: items,
        meta
    };
}
export async function createNote(tripId, body) {
    const res = await apiClient.post(`/trips/${tripId}/notes`, body);
    return unwrap(res);
}
export async function updateNote(tripId, noteId, body) {
    const res = await apiClient.put(`/trips/${tripId}/notes/${noteId}`, body);
    return unwrap(res);
}
export async function deleteNote(tripId, noteId) {
    await apiClient.delete(`/trips/${tripId}/notes/${noteId}`);
}
