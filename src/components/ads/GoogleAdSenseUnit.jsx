import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT } from "@/lib/adsense";

let adsenseScriptPromise = null;

function loadAdsenseScript(client) {
  if (typeof document === "undefined") return Promise.resolve();
  if (adsenseScriptPromise) return adsenseScriptPromise;

  const existing = document.querySelector(
    'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
  );
  if (existing) {
    adsenseScriptPromise = existing.dataset.loaded === "1"
      ? Promise.resolve()
      : new Promise((resolve) => {
          existing.addEventListener("load", () => resolve(), { once: true });
        });
    return adsenseScriptPromise;
  }

  adsenseScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    s.crossOrigin = "anonymous";
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error("AdSense script failed to load"));
    document.head.appendChild(s);
  });
  return adsenseScriptPromise;
}

/**
 * One AdSense display unit. Requires `VITE_ADSENSE_CLIENT` and a slot id (e.g. page-specific env).
 * @param {{ adSlot: string, adFormat?: string, className?: string, style?: React.CSSProperties }} props
 */
export default function GoogleAdSenseUnit({
  adSlot,
  adFormat = "auto",
  className = "",
  style,
}) {
  const pushedRef = useRef(false);
  const insRef = useRef(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !adSlot || pushedRef.current) return undefined;
    const ins = insRef.current;
    if (!ins) return undefined;

    let cancelled = false;

    (async () => {
      try {
        await loadAdsenseScript(ADSENSE_CLIENT);
        if (cancelled || pushedRef.current) return;
        pushedRef.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        pushedRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adSlot]);

  if (!ADSENSE_CLIENT || !adSlot) return null;

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`.trim()}
      style={{ display: "block", textAlign: "center", ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={adFormat === "auto" ? "true" : undefined}
    />
  );
}
