import { useDestinationImage } from "@/hooks/useDestinationImage";
import { SmartImage } from "@/components/shared/SmartImage";
import { getCityThumbnail } from "@/lib/cityImages";
import { sanitizeRemoteImageUrl } from "@/lib/imageUrl";

<<<<<<< HEAD
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
=======
export default function DestinationImage({ name, city, query, icon: Icon, big = false, imageUrl }) {
  const [loaded, setLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const { data, isLoading, isError } = useDestinationImage(imageUrl ? null : (query || city || name));
  
  const finalImageUrl = imageUrl || data?.imageUrl;
  const showFallback = imageFailed || (!imageUrl && (isError || (!isLoading && !data?.imageUrl)));

  return (
    <div className={`dest-card-bg${loaded ? " dest-card-bg-loaded" : ""}`}>
      {!loaded && !showFallback && <div className="dest-image-skeleton" aria-hidden="true" />}

      {finalImageUrl && !showFallback && (
        <img
          src={finalImageUrl}
          srcSet={!imageUrl && data?.smallImageUrl ? `${data.smallImageUrl} 640w, ${finalImageUrl} 1200w` : undefined}
          sizes={big ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 50vw, 33vw"}
          alt={data?.alt || `${name} travel destination`}
          className="dest-card-img"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      )}
      
      {showFallback && (
        <div className="dest-card-fallback" aria-hidden="true">
          <Icon size={big ? 64 : 48} color="rgba(255,255,255,0.2)" />
        </div>
      )}
>>>>>>> ee97be13604b99dcb33b954f50b95a57645e17ef

      {data?.source === "unsplash" && data.photographerName && data.photographerUrl && (
        <a className="dest-card-credit" href={data.photographerUrl} target="_blank" rel="noreferrer">
          Photo: {data.photographerName}
        </a>
      )}
    </div>
  );
}
