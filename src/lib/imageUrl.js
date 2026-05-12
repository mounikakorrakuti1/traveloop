/** URLs that should never be used as <img src> (broken, retired, or non-remote). */
export function isUsableRemoteImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const t = url.trim();
  if (!/^https:\/\//i.test(t)) return false;
  const l = t.toLowerCase();
  if (l.includes("source.unsplash.com")) return false;
  if (l.includes("localhost") || l.includes("127.0.0.1")) return false;
  return true;
}

export function sanitizeRemoteImageUrl(url) {
  return isUsableRemoteImageUrl(url) ? url.trim() : undefined;
}
