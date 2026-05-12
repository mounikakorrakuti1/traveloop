const WIKI_API = "https://en.wikipedia.org/w/api.php";

/**
 * Returns a thumbnail URL for a Wikipedia page near the given coordinates (open data, CC-licensed media).
 * Uses the MediaWiki geosearch + pageimages APIs (CORS-friendly with origin=*).
 */
export async function fetchWikipediaThumbnailNear(lat, lon, { radiusM = 8000 } = {}) {
  const latN = Number(lat);
  const lonN = Number(lon);
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) return null;

  const geoRes = await fetch(
    `${WIKI_API}?action=query&list=geosearch&gscoord=${encodeURIComponent(latN)}|${encodeURIComponent(lonN)}&gsradius=${radiusM}&gslimit=5&format=json&origin=*`
  );
  if (!geoRes.ok) return null;
  const geoJson = await geoRes.json();
  const hits = geoJson?.query?.geosearch;
  if (!Array.isArray(hits) || hits.length === 0) return null;

  const title = hits[0]?.title;
  if (!title) return null;

  const imgRes = await fetch(
    `${WIKI_API}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&origin=*&piprop=thumbnail&pithumbsize=480`
  );
  if (!imgRes.ok) return null;
  const imgJson = await imgRes.json();
  const pages = imgJson?.query?.pages;
  if (!pages || typeof pages !== "object") return null;
  const first = Object.values(pages)[0];
  const url = first?.thumbnail?.source;
  return typeof url === "string" && url.startsWith("http") ? url : null;
}
