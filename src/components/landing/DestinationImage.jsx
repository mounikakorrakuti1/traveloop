import { useState } from "react";
import { useDestinationImage } from "@/hooks/useDestinationImage";
import { getCityThumbnail } from "@/lib/cityImages";
import { sanitizeRemoteImageUrl } from "@/lib/imageUrl";

export default function DestinationImage({ name, city, query, icon: Icon, big = false, imageUrl }) {
  const [imageFailed, setImageFailed] = useState(false);
  const key = (query || city || name || "").trim();
  
  // Only fetch if no explicit imageUrl is provided
  const { data, isLoading, isError } = useDestinationImage(imageUrl ? null : (key.length > 1 ? key : "default"));
  
  const finalImageUrl = imageUrl || sanitizeRemoteImageUrl(data?.imageUrl);
  const showFallback = imageFailed || (!finalImageUrl && (isError || (!isLoading && !data?.imageUrl)));

  return (
    <div className={`dest-card-bg${!isLoading ? " dest-card-bg-loaded" : ""}`}>
      {isLoading && !finalImageUrl && <div className="dest-image-skeleton" aria-hidden="true" />}

      {finalImageUrl && !showFallback && (
        <img
          src={finalImageUrl}
          alt={data?.alt || `${name} travel destination`}
          className="dest-card-img"
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => {
            // If the primary image fails, try the city thumbnail as a last resort before showing icon
            const fallback = getCityThumbnail({ name: city || name || query });
            if (finalImageUrl !== fallback) {
              // We could potentially set a local state for fallback here, 
              // but for simplicity and since DestinationImage is used in grids, 
              // we'll just move to the icon fallback if it fails.
              setImageFailed(true);
            } else {
              setImageFailed(true);
            }
          }}
        />
      )}
      
      {showFallback && Icon && (
        <div className="dest-card-fallback" aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--cl-surface-alt)" }}>
          <Icon size={big ? 64 : 48} color="rgba(255,255,255,0.2)" />
        </div>
      )}

      {data?.source === "unsplash" && data.photographerName && data.photographerUrl && (
        <a className="dest-card-credit" href={data.photographerUrl} target="_blank" rel="noreferrer">
          Photo: {data.photographerName}
        </a>
      )}
    </div>
  );
}
