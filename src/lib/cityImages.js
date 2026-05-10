const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`;

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
    hero: image("photo-1605540436563-5bca919ae766"),
    thumbnail: image("photo-1605540436563-5bca919ae766"),
    gallery: [
      image("photo-1605540436563-5bca919ae766"),
      image("photo-1610563166150-b34df4f3bcd6"),
      image("photo-1483728642387-6c3bdd6c93e5"),
    ],
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
    hero: image("photo-1600100397608-f010a9f7fd50"),
    thumbnail: image("photo-1600100397608-f010a9f7fd50"),
    gallery: [
      image("photo-1600100397608-f010a9f7fd50"),
      image("photo-1582510003544-4d00b7f74220"),
      image("photo-1599661046289-e31897846e41"),
    ],
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
    hero: image("photo-1500530855697-b586d89ba3ee"),
    thumbnail: image("photo-1500530855697-b586d89ba3ee"),
    gallery: [
      image("photo-1500530855697-b586d89ba3ee"),
      image("photo-1506744038136-46273834b3fb"),
      image("photo-1519681393784-d120267933ba"),
    ],
  },
  Cherrapunji: {
    hero: image("photo-1506744038136-46273834b3fb"),
    thumbnail: image("photo-1506744038136-46273834b3fb"),
    gallery: [
      image("photo-1506744038136-46273834b3fb"),
      image("photo-1432405972618-c60b0225b8f9"),
      image("photo-1519681393784-d120267933ba"),
    ],
  },
  Dawki: {
    hero: image("photo-1432405972618-c60b0225b8f9"),
    thumbnail: image("photo-1432405972618-c60b0225b8f9"),
    gallery: [
      image("photo-1432405972618-c60b0225b8f9"),
      image("photo-1500530855697-b586d89ba3ee"),
      image("photo-1506744038136-46273834b3fb"),
    ],
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
    hero: image("photo-1506744038136-46273834b3fb"),
    thumbnail: image("photo-1506744038136-46273834b3fb"),
    gallery: [
      image("photo-1506744038136-46273834b3fb"),
      image("photo-1432405972618-c60b0225b8f9"),
      image("photo-1519681393784-d120267933ba"),
    ],
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

export function getCityFromTitle(title) {
  const value = normalize(title);
  const match = Object.keys(CITY_IMAGES).find((city) => value.includes(city.toLowerCase()));
  return match || "default";
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
  const explicit = typeof cityOrTitle === "object" ? cityOrTitle?.thumbnailUrl : "";
  return explicit || getCityImages(cityOrTitle).thumbnail;
}
