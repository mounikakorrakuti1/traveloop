import { useDestinationImage } from "@/hooks/useDestinationImage";
import { SmartImage } from "@/components/shared/SmartImage";
import { getCityThumbnail } from "@/lib/cityImages";
import { sanitizeRemoteImageUrl } from "@/lib/imageUrl";

export function CityImageThumb({ city, title, className = "" }) {
  const cityObj = typeof city === "object" && city !== null ? city : null;
  const queryCity = cityObj?.name || (typeof city === "string" ? city : "") || title || "";
  const { data, isLoading } = useDestinationImage(queryCity.trim().length > 1 ? queryCity : "default");
  const primary = sanitizeRemoteImageUrl(data?.imageUrl);
  const fallback = getCityThumbnail(cityObj || { name: queryCity });
  const alt = title || queryCity || "Destination";

  return (
    <div className={`city-image-thumb ${!isLoading ? "city-image-thumb-loaded" : ""} ${className}`}>
      {isLoading && <div className="city-image-thumb-skeleton" aria-hidden="true" />}
      <SmartImage
        src={primary}
        fallbackSrc={fallback}
        alt={alt}
        className="city-image-thumb-img"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

export function UnsplashCredit({ image }) {
  if (image?.source !== "unsplash" || !image.photographerName || !image.photographerUrl) return null;

  return (
    <a className="unsplash-credit" href={image.photographerUrl} target="_blank" rel="noreferrer">
      Photo: {image.photographerName}
    </a>
  );
}
