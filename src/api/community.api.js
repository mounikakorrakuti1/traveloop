import { apiClient, unwrap, unwrapPaginated } from "./client";

export async function listCommunityFeed(params) {
  const res = await apiClient.get("/community", { params });
  const { items, meta } = unwrapPaginated(res);
  return { posts: items, meta };
}

export async function createCommunityPost(body) {
  const res = await apiClient.post("/community", body);
  return unwrap(res);
}

export async function toggleCommunityLike(postId) {
  const res = await apiClient.post(`/community/${postId}/like`);
  return unwrap(res);
}

export async function toggleCommunityBookmark(postId) {
  const res = await apiClient.post(`/community/${postId}/bookmark`);
  return unwrap(res);
}

export async function addCommunityComment(postId, body) {
  const res = await apiClient.post(`/community/${postId}/comments`, body);
  return unwrap(res);
}

export async function getSimilarTravelers() {
  const res = await apiClient.get("/community/similar-travelers");
  return unwrap(res);
}

export async function listPlaceChatMessages(params) {
  const res = await apiClient.get("/community/place-chat", { params });
  return unwrap(res);
}

export async function sendPlaceChatMessage(body) {
  const res = await apiClient.post("/community/place-chat", body);
  return unwrap(res);
}
