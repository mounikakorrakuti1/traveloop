import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { cacheTtl, getCached, setCached } from './cache';
import { fallbackGallery, fallbackWeather } from './fallbacks';

type Coordinates = { latitude: number; longitude: number };

const fetchJson = async <T>(url: URL, init?: RequestInit): Promise<T | null> => {
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      logger.warn('External travel API returned non-OK response', { url: url.hostname, status: response.status });
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    logger.warn('External travel API request failed', { url: url.hostname, error: error instanceof Error ? error.message : error });
    return null;
  }
};

export class WikipediaClient {
  public async summary(name: string): Promise<{ description: string | null; url: string | null }> {
    const cacheKey = `wiki:${name.toLowerCase()}`;
    const cached = getCached<{ description: string | null; url: string | null }>(cacheKey);
    if (cached) return cached;

    const url = new URL(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    const payload = await fetchJson<{ extract?: string; content_urls?: { desktop?: { page?: string } } }>(url, {
      headers: { 'User-Agent': 'Traveloop/1.0 travel-intelligence' }
    });

    return setCached(
      cacheKey,
      {
        description: payload?.extract ?? null,
        url: payload?.content_urls?.desktop?.page ?? null
      },
      cacheTtl.long
    );
  }
}

export class UnsplashClient {
  public async images(query: string): Promise<{ image: string; gallery: string[]; source: string }> {
    const cacheKey = `unsplash:${query.toLowerCase()}`;
    const cached = getCached<{ image: string; gallery: string[]; source: string }>(cacheKey);
    if (cached) return cached;

    const fallback = fallbackGallery(query);
    if (!env.UNSPLASH_ACCESS_KEY || env.UNSPLASH_ACCESS_KEY.startsWith('replace-with')) {
      return setCached(cacheKey, { image: fallback[0] ?? '', gallery: fallback, source: 'fallback' }, cacheTtl.long);
    }

    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', `${query} travel destination`);
    url.searchParams.set('per_page', '8');
    url.searchParams.set('orientation', 'landscape');
    const payload = await fetchJson<{ results?: Array<{ urls?: { regular?: string } }> }>(url, {
      headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` }
    });
    const gallery = (payload?.results ?? []).map((item) => item.urls?.regular).filter((item): item is string => Boolean(item));
    const value = gallery.length > 0 ? { image: gallery[0] ?? '', gallery, source: 'unsplash' } : { image: fallback[0] ?? '', gallery: fallback, source: 'fallback' };
    return setCached(cacheKey, value, cacheTtl.long);
  }
}

export class OpenWeatherClient {
  public async current(city: string, coords?: Coordinates, bestSeason?: string | null) {
    const cacheKey = `weather:${city.toLowerCase()}:${coords?.latitude ?? 'na'}:${coords?.longitude ?? 'na'}`;
    const cached = getCached<ReturnType<typeof fallbackWeather>>(cacheKey);
    if (cached) return cached;

    if (!env.OPENWEATHER_API_KEY || env.OPENWEATHER_API_KEY.startsWith('replace-with')) {
      return setCached(cacheKey, fallbackWeather(bestSeason), cacheTtl.short);
    }

    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    if (coords) {
      url.searchParams.set('lat', String(coords.latitude));
      url.searchParams.set('lon', String(coords.longitude));
    } else {
      url.searchParams.set('q', city);
    }
    url.searchParams.set('units', 'metric');
    url.searchParams.set('appid', env.OPENWEATHER_API_KEY);
    const payload = await fetchJson<{ main?: { temp?: number; humidity?: number }; weather?: Array<{ main?: string; description?: string }>; wind?: { speed?: number } }>(url);
    const condition = payload?.weather?.[0]?.description ?? payload?.weather?.[0]?.main;
    const value = payload?.main?.temp
      ? {
          temp: Math.round(payload.main.temp),
          condition: condition ? condition[0]?.toUpperCase() + condition.slice(1) : 'Current weather available',
          humidity: payload.main.humidity ?? null,
          windKph: payload.wind?.speed ? Math.round(payload.wind.speed * 3.6) : null,
          source: 'openweather'
        }
      : fallbackWeather(bestSeason);
    return setCached(cacheKey, value, cacheTtl.short);
  }
}

export class GeoDbClient {
  public async city(name: string) {
    const cacheKey = `geodb:city:${name.toLowerCase()}`;
    const cached = getCached<{ name: string; country: string; region: string | null; latitude: number; longitude: number } | null>(cacheKey);
    if (cached !== null) return cached;
    if (!env.GEODB_API_KEY || env.GEODB_API_KEY.startsWith('replace-with')) return null;

    const url = new URL('https://wft-geo-db.p.rapidapi.com/v1/geo/cities');
    url.searchParams.set('namePrefix', name);
    url.searchParams.set('limit', '1');
    url.searchParams.set('sort', '-population');
    const payload = await fetchJson<{ data?: Array<{ city?: string; country?: string; region?: string; latitude?: number; longitude?: number }> }>(url, {
      headers: { 'X-RapidAPI-Key': env.GEODB_API_KEY, 'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com' }
    });
    const item = payload?.data?.[0];
    const value =
      item?.city && item.country && typeof item.latitude === 'number' && typeof item.longitude === 'number'
        ? { name: item.city, country: item.country, region: item.region ?? null, latitude: item.latitude, longitude: item.longitude }
        : null;
    if (value) setCached(cacheKey, value, cacheTtl.long);
    return value;
  }
}

export class OpenTripMapClient {
  public async attractions(name: string, coords?: Coordinates) {
    const cacheKey = `opentripmap:${name.toLowerCase()}:${coords?.latitude ?? 'na'}:${coords?.longitude ?? 'na'}`;
    const cached = getCached<Array<{ name: string; category: string; latitude: number | null; longitude: number | null; xid: string | null }>>(cacheKey);
    if (cached) return cached;

    if (!env.OPENTRIPMAP_API_KEY || env.OPENTRIPMAP_API_KEY.startsWith('replace-with')) {
      return setCached(cacheKey, fallbackAttractions(name), cacheTtl.medium);
    }

    let location = coords;
    if (!location) {
      const geoUrl = new URL('https://api.opentripmap.com/0.1/en/places/geoname');
      geoUrl.searchParams.set('name', name);
      geoUrl.searchParams.set('apikey', env.OPENTRIPMAP_API_KEY);
      const geo = await fetchJson<{ lat?: number; lon?: number }>(geoUrl);
      if (typeof geo?.lat === 'number' && typeof geo.lon === 'number') {
        location = { latitude: geo.lat, longitude: geo.lon };
      }
    }

    if (!location) return setCached(cacheKey, fallbackAttractions(name), cacheTtl.medium);

    const url = new URL('https://api.opentripmap.com/0.1/en/places/radius');
    url.searchParams.set('radius', '8000');
    url.searchParams.set('lat', String(location.latitude));
    url.searchParams.set('lon', String(location.longitude));
    url.searchParams.set('limit', '12');
    url.searchParams.set('rate', '2');
    url.searchParams.set('format', 'json');
    url.searchParams.set('apikey', env.OPENTRIPMAP_API_KEY);
    const payload = await fetchJson<Array<{ name?: string; kinds?: string; point?: { lat?: number; lon?: number }; xid?: string }>>(url);
    const items = (payload ?? [])
      .filter((item) => item.name)
      .map((item) => ({
        name: item.name ?? 'Local attraction',
        category: item.kinds?.split(',')[0]?.replace(/_/g, ' ') ?? 'sightseeing',
        latitude: item.point?.lat ?? null,
        longitude: item.point?.lon ?? null,
        xid: item.xid ?? null
      }))
      .slice(0, 8);
    return setCached(cacheKey, items.length > 0 ? items : fallbackAttractions(name), cacheTtl.medium);
  }
}

const fallbackAttractions = (name: string) => [
  { name: `${name} heritage quarter`, category: 'cultural', latitude: null, longitude: null, xid: null },
  { name: `${name} central market`, category: 'food', latitude: null, longitude: null, xid: null },
  { name: `${name} viewpoint walk`, category: 'sightseeing', latitude: null, longitude: null, xid: null }
];

export const wikipediaClient = new WikipediaClient();
export const unsplashClient = new UnsplashClient();
export const openWeatherClient = new OpenWeatherClient();
export const geoDbClient = new GeoDbClient();
export const openTripMapClient = new OpenTripMapClient();
