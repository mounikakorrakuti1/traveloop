import { useEffect, useState } from "react";
import { sanitizeRemoteImageUrl } from "@/lib/imageUrl";

/** Tries primary URL first; swaps to fallback on failure (handles broken/expired CDN links). */
export function SmartImage({ src, fallbackSrc, alt, className, style, loading = "lazy", title }) {
  const safeFallback = fallbackSrc || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80";
  const primary = sanitizeRemoteImageUrl(src);
  const initial = primary ?? safeFallback;
  const [current, setCurrent] = useState(initial);

  useEffect(() => {
    const next = sanitizeRemoteImageUrl(src) ?? safeFallback;
    setCurrent(next);
  }, [src, safeFallback]);

  return (
    <img
      src={current}
      alt={alt || ""}
      title={title}
      loading={loading}
      className={className}
      style={style}
      onError={() => {
        if (current !== safeFallback) setCurrent(safeFallback);
      }}
    />
  );
}
