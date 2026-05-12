import { useQuery } from "@tanstack/react-query";
import { SmartImage } from "@/components/shared/SmartImage";
import { getCityThumbnail } from "@/lib/cityImages";
import { sanitizeRemoteImageUrl } from "@/lib/imageUrl";
import { fetchWikipediaThumbnailNear } from "@/lib/wikimediaImage";

/**
 * City hero/thumbnail: DB URL first, then Wikipedia image near coordinates, then curated Unsplash fallback.
 */
export function CityPlaceImage({ city, alt, className, style, loading = "lazy" }) {
  const explicit = sanitizeRemoteImageUrl(city?.thumbnailUrl || city?.image || null);
  const lat = city?.latitude;
  const lon = city?.longitude;
  const unsplashFallback = getCityThumbnail(city);

  const { data: wikiThumb } = useQuery({
    queryKey: ["wikipedia-near-thumb", lat, lon],
    queryFn: () => fetchWikipediaThumbnailNear(lat, lon),
    enabled: Boolean(!explicit && lat != null && lon != null),
    staleTime: 7 * 24 * 60 * 60 * 1000,
    retry: 1,
  });

  const fromDb = Boolean(explicit);
  const src = explicit || wikiThumb || undefined;
  const wikiTitle = !fromDb && wikiThumb ? "Photo: Wikipedia / Wikimedia Commons (CC-licensed)" : undefined;

  return (
    <SmartImage
      src={src}
      fallbackSrc={unsplashFallback}
      alt={alt || city?.name || "Destination"}
      title={wikiTitle}
      className={className}
      style={style}
      loading={loading}
    />
  );
}
