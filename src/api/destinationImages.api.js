import { apiClient, unwrap } from "./client";

export async function getDestinationImage(city, { signal } = {}) {
  const res = await apiClient.get(`/destination/${encodeURIComponent(city)}`, { signal });
  const destination = unwrap(res);

  return {
    city: destination.name ?? city,
    imageUrl: destination.image,
    smallImageUrl: destination.image,
    alt: `${destination.name ?? city} travel destination`,
    photographerName: null,
    photographerUrl: null,
    unsplashUrl: null,
    source: destination.sources?.images ?? "traveloop",
  };
}
