import { getCityImages } from "@/lib/cityImages";
import { sanitizeRemoteImageUrl } from "@/lib/imageUrl";

const DEFAULT_HERO =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80";

/**
 * Cover for trip cards: prefer API coverPhotoUrl when usable (Unsplash Source retired — treat as unreliable).
 */
export function getTripCardCoverUrl(trip) {
  const url = sanitizeRemoteImageUrl(trip?.coverPhotoUrl);
  if (url) return url;
  const pack = getCityImages(trip?.title || trip?.description || "");
  return pack?.hero || DEFAULT_HERO;
}
