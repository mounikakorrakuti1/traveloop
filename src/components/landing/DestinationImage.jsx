import { useDestinationImage } from "@/hooks/useDestinationImage";
import { SmartImage } from "@/components/shared/SmartImage";
import { getCityThumbnail } from "@/lib/cityImages";
import { sanitizeRemoteImageUrl } from "@/lib/imageUrl";

export default function DestinationImage({ name, city, query, icon: _Icon, big: _big }) {
  const key = (query || city || name || "").trim();
  const { data, isLoading } = useDestinationImage(key.length > 1 ? key : "default");
  const primary = sanitizeRemoteImageUrl(data?.imageUrl);
  const fallback = getCityThumbnail({ name: city || name || query });
  const alt = data?.alt || `${name} travel destination`;

  return (
    <div className={`dest-card-bg${!isLoading ? " dest-card-bg-loaded" : ""}`}>
      {isLoading && <div className="dest-image-skeleton" aria-hidden="true" />}
      <SmartImage
        src={primary}
        fallbackSrc={fallback}
        alt={alt}
        className="dest-card-img"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {data?.source === "unsplash" && data.photographerName && data.photographerUrl && (
        <a className="dest-card-credit" href={data.photographerUrl} target="_blank" rel="noreferrer">
          Photo: {data.photographerName}
        </a>
      )}
    </div>
  );
}
