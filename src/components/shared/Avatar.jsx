import { useEffect, useState, useMemo } from "react";
import { clsx } from "clsx";

/**
 * Premium avatar component with:
 * - Cloudinary/URL image display
 * - Initials fallback (no broken images)
 * - Loading shimmer
 * - Configurable sizes
 * - Gradient backgrounds per user
 */

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #E07A5F 0%, #F2CC8F 100%)",
  "linear-gradient(135deg, #81B29A 0%, #3D405B 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const SIZE_MAP = {
  xs: { size: "1.75rem", font: "0.6rem" },
  sm: { size: "2.25rem", font: "0.75rem" },
  md: { size: "3rem", font: "1rem" },
  lg: { size: "4rem", font: "1.4rem" },
  xl: { size: "6rem", font: "2rem" },
  "2xl": { size: "8rem", font: "2.8rem" },
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGradientIndex(name) {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_GRADIENTS.length;
}

export function Avatar({
  src,
  url,
  name,
  size = "md",
  className,
  style,
  onClick,
  ...rest
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const initials = useMemo(() => getInitials(name), [name]);
  const gradient = useMemo(
    () => AVATAR_GRADIENTS[getGradientIndex(name)],
    [name]
  );
  const dim = SIZE_MAP[size] || SIZE_MAP.md;

  const imageSrc = src || url;
  const showImage = imageSrc && !imgError;

  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [imageSrc]);

  return (
    <div
      className={clsx("avatar-premium", className)}
      style={{
        width: dim.size,
        height: dim.size,
        borderRadius: "20%",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        cursor: onClick ? "pointer" : undefined,
        background: showImage && imgLoaded ? "var(--cl-bg-alt)" : gradient,
        display: "grid",
        placeItems: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        ...style,
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...rest}
    >
      {/* Initials — always rendered beneath image */}
      <span
        style={{
          position: "absolute",
          fontSize: dim.font,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: "0.04em",
          fontFamily: "var(--font-display)",
          userSelect: "none",
          opacity: showImage && imgLoaded ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {initials}
      </span>

      {/* Image */}
      {showImage && (
        <img
          src={imageSrc}
          alt={name || "Avatar"}
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            inset: 0,
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
          loading="lazy"
          decoding="async"
        />
      )}

      {/* Loading shimmer */}
      {showImage && !imgLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.15) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.6s ease infinite",
          }}
        />
      )}
    </div>
  );
}
