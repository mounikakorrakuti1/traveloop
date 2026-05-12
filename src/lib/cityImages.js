import { sanitizeRemoteImageUrl } from "@/lib/imageUrl";

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

/** Stable Wikimedia Commons thumbnails (location-accurate, CC-licensed). */
const WM = {
  cherrapunji:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Cherrapunji.jpg/640px-Cherrapunji.jpg",
  dawki: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Umngot_river%2C_Dawki.jpg/640px-Umngot_river%2C_Dawki.jpg",
  gulmarg:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Ancient_Temple%2C_Gulmarg.jpg/640px-Ancient_Temple%2C_Gulmarg.jpg",
  hampi:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/640px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg",
  shillong:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Elephant_Falls_II%2C_Shillong.jpg/640px-Elephant_Falls_II%2C_Shillong.jpg",
};

const DEFAULT_IMAGES = {
  hero: image("photo-1488646953014-85cb44e25828"),
  thumbnail: image("photo-1500530855697-b586d89ba3ee"),
  gallery: [
    image("photo-1488646953014-85cb44e25828"),
    image("photo-1500530855697-b586d89ba3ee"),
    image("photo-1507525428034-b723cf961d3e"),
  ],
};

const CITY_IMAGES = {
  Vijayawada: {
    hero: image("photo-1590050752117-238cb0fb12b1"),
    thumbnail: image("photo-1590050752117-238cb0fb12b1"),
    gallery: [
      image("photo-1590050752117-238cb0fb12b1"),
      image("photo-1626777552726-4a6b54c97e46"),
      image("photo-1524492412937-b28074a5d7da"),
    ],
  },
  Srinagar: {
    hero: image("photo-1595815771614-ade9d652a65d"),
    thumbnail: image("photo-1595815771614-ade9d652a65d"),
    gallery: [
      image("photo-1595815771614-ade9d652a65d"),
      image("photo-1626621341517-bbf3d9990a23"),
      image("photo-1566837497312-7be7830ae9b5"),
    ],
  },
  Gulmarg: {
    hero: WM.gulmarg,
    thumbnail: WM.gulmarg,
    gallery: [WM.gulmarg, image("photo-1610563166150-b34df4f3bcd6"), image("photo-1483728642387-6c3bdd6c93e5")],
  },
  Pahalgam: {
    hero: image("photo-1626621341517-bbf3d9990a23"),
    thumbnail: image("photo-1626621341517-bbf3d9990a23"),
    gallery: [
      image("photo-1626621341517-bbf3d9990a23"),
      image("photo-1500530855697-b586d89ba3ee"),
      image("photo-1519681393784-d120267933ba"),
    ],
  },
  Hampi: {
    hero: WM.hampi,
    thumbnail: WM.hampi,
    gallery: [WM.hampi, image("photo-1582510003544-4d00b7f74220"), image("photo-1599661046289-e31897846e41")],
  },
  Gokarna: {
    hero: image("photo-1507525428034-b723cf961d3e"),
    thumbnail: image("photo-1507525428034-b723cf961d3e"),
    gallery: [
      image("photo-1507525428034-b723cf961d3e"),
      image("photo-1519046904884-53103b34b206"),
      image("photo-1500530855697-b586d89ba3ee"),
    ],
  },
  Shillong: {
    hero: WM.shillong,
    thumbnail: WM.shillong,
    gallery: [WM.shillong, image("photo-1506744038136-46273834b3fb"), image("photo-1519681393784-d120267933ba")],
  },
  Cherrapunji: {
    hero: WM.cherrapunji,
    thumbnail: WM.cherrapunji,
    gallery: [WM.cherrapunji, WM.dawki, image("photo-1519681393784-d120267933ba")],
  },
  Dawki: {
    hero: WM.dawki,
    thumbnail: WM.dawki,
    gallery: [WM.dawki, WM.cherrapunji, image("photo-1506744038136-46273834b3fb")],
  },
  Kashmir: {
    hero: image("photo-1595815771614-ade9d652a65d"),
    thumbnail: image("photo-1595815771614-ade9d652a65d"),
    gallery: [
      image("photo-1595815771614-ade9d652a65d"),
      image("photo-1605540436563-5bca919ae766"),
      image("photo-1626621341517-bbf3d9990a23"),
    ],
  },
  Meghalaya: {
    hero: WM.shillong,
    thumbnail: WM.shillong,
    gallery: [WM.shillong, WM.cherrapunji, WM.dawki],
  },
  Goa: {
    hero: image("photo-1512343879784-a960bf40e7f2"),
    thumbnail: image("photo-1512343879784-a960bf40e7f2"),
    gallery: [
      image("photo-1512343879784-a960bf40e7f2"),
      image("photo-1507525428034-b723cf961d3e"),
      image("photo-1519046904884-53103b34b206"),
    ],
  },
};

function normalize(value) {
  return String(value || "").toLowerCase();
}

const CITY_KEYS_SORTED = Object.keys(CITY_IMAGES).sort((a, b) => b.length - a.length);

/** Leftmost whole-word city token in a title (reduces wrong generic matches). */
export function getCityFromTitle(title) {
  const raw = String(title || "").trim();
  if (!raw) return "default";
  const lower = normalize(raw);
  let bestKey = null;
  let bestIndex = Infinity;
  for (const city of CITY_KEYS_SORTED) {
    const needle = city.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(needle, from);
      if (idx === -1) break;
      const before = idx === 0 || !/[a-z0-9]/i.test(lower[idx - 1]);
      const after = idx + needle.length >= lower.length || !/[a-z0-9]/i.test(lower[idx + needle.length]);
      if (before && after && idx < bestIndex) {
        bestIndex = idx;
        bestKey = city;
        break;
      }
      from = idx + 1;
    }
  }
  return bestKey || "default";
}

export function getCityImages(cityOrTitle) {
  const cityName = typeof cityOrTitle === "object" ? cityOrTitle?.name : cityOrTitle;
  const key = getCityFromTitle(cityName);
  return CITY_IMAGES[key] || DEFAULT_IMAGES;
}

export function getCityHeroImage(cityOrTitle) {
  return getCityImages(cityOrTitle).hero;
}

export function getCityThumbnail(cityOrTitle) {
  const explicit =
    typeof cityOrTitle === "object"
      ? sanitizeRemoteImageUrl(cityOrTitle?.thumbnailUrl) || sanitizeRemoteImageUrl(cityOrTitle?.image)
      : "";
  if (explicit) return explicit;
  return getCityImages(cityOrTitle).thumbnail;
}
