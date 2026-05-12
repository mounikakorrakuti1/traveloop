import { apiClient, unwrap } from "./client";

export async function getDestinationIntelligence(cityId) {
  const res = await apiClient.get(`/destinations/${cityId}/intelligence`);
  return unwrap(res);
}

export async function getTrendingDestinations() {
  const res = await apiClient.get("/destinations/trending");
  return unwrap(res);
}

export async function getDestinationByName(name) {
  const res = await apiClient.get(`/destination/${encodeURIComponent(name)}`);
  return unwrap(res);
}

export async function getNearbyDestinations(params) {
  const res = await apiClient.get("/nearby", { params });
  return unwrap(res);
}

export async function getDestinationWeather(city) {
  const res = await apiClient.get(`/weather/${encodeURIComponent(city)}`);
  return unwrap(res);
}

export async function searchTransportOptions(params) {
  const res = await apiClient.get("/destinations/transport/search", { params });
  return unwrap(res);
}
