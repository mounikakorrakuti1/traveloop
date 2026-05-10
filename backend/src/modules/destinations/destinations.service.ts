import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/error-handler';
import type { TransportSearchQueryDto } from './destinations.dto';

type CacheItem<T> = { expiresAt: number; value: T };
const cache = new Map<string, CacheItem<unknown>>();

const getCached = <T>(key: string): T | null => {
  const item = cache.get(key);
  if (!item || item.expiresAt < Date.now()) return null;
  return item.value as T;
};
const setCached = <T>(key: string, value: T, ttlMs: number): T => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
};

/** Stable Unsplash CDN URLs (source.unsplash.com is retired/unreliable). */
const FALLBACK_DESTINATION_IMAGES = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1600&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80'
] as const;

const hashSeed = (value: string): number =>
  Math.abs(value.split('').reduce((h, ch) => ch.charCodeAt(0) + ((h << 5) - h), 0));

const fallbackGallery = (city: string): string[] => {
  const start = hashSeed(city.toLowerCase()) % FALLBACK_DESTINATION_IMAGES.length;
  const out: string[] = [];
  for (let i = 0; i < FALLBACK_DESTINATION_IMAGES.length; i += 1) {
    out.push(FALLBACK_DESTINATION_IMAGES[(start + i) % FALLBACK_DESTINATION_IMAGES.length] ?? '');
  }
  return out;
};

const parseMonthRange = (bestSeason?: string | null): string =>
  bestSeason && bestSeason.length > 0 ? bestSeason : 'October to March';

export class DestinationsService {
  public async getIntelligence(cityId: string) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) throw new AppError('Destination not found', 'NOT_FOUND', 404);

    const cacheKey = `city-intel:${city.id}`;
    const cached = getCached<unknown>(cacheKey);
    if (cached) return cached;

    const query = `${city.name}, ${city.country}`;
    const imageData = await this.fetchImageSet(query);
    const places = await this.fetchPlaces(query);
    const weather = this.estimateWeather(city.bestSeason ?? undefined);

    return setCached(
      cacheKey,
      {
        city: {
          id: city.id,
          name: city.name,
          country: city.country,
          state: city.state,
          bestSeason: city.bestSeason
        },
        heroImage: imageData.heroImage,
        gallery: imageData.gallery,
        famousPlaces: places.famousPlaces,
        landmarks: places.landmarks,
        restaurants: places.restaurants,
        cafes: places.cafes,
        hiddenGems: places.hiddenGems,
        weather,
        bestTimeToVisit: parseMonthRange(city.bestSeason),
        estimatedBudgetInr: this.estimateBudget(city.costIndex ?? 'medium'),
        safetyTips: [
          'Prefer registered cabs after 9 PM and keep hotel contact pinned.',
          'Store a digital copy of ID and bookings in your trip documents.',
          'Carry UPI and one backup card, especially for hill/coastal transfers.'
        ],
        transportationTips: [
          'For intercity routes, compare flight and overnight train options.',
          'Book airport or station transfer 12-24 hours ahead in peak season.',
          'Start day trips early to avoid traffic and attraction queues.'
        ]
      },
      1000 * 60 * 30
    );
  }

  public async searchTransport(query: TransportSearchQueryDto) {
    const cacheKey = `transport:${JSON.stringify(query)}`;
    const cached = getCached<unknown>(cacheKey);
    if (cached) return cached;

    const fallback = this.generateFallbackTransport(query);
    return setCached(cacheKey, { options: fallback, provider: 'fallback-demo' }, 1000 * 60 * 10);
  }

  private async fetchImageSet(query: string): Promise<{ heroImage: string; gallery: string[] }> {
    const fallback = fallbackGallery(query);
    if (!env.UNSPLASH_ACCESS_KEY) return { heroImage: fallback[0] ?? '', gallery: fallback };
    try {
      const url = new URL('https://api.unsplash.com/search/photos');
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', '6');
      url.searchParams.set('orientation', 'landscape');
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` }
      });
      if (!res.ok) return { heroImage: fallback[0] ?? '', gallery: fallback };
      const payload = (await res.json()) as { results?: Array<{ urls?: { regular?: string } }> };
      const urls = (payload.results ?? [])
        .map((item) => item.urls?.regular)
        .filter((item): item is string => Boolean(item));
      if (urls.length === 0) return { heroImage: fallback[0] ?? '', gallery: fallback };
      return { heroImage: urls[0] ?? fallback[0] ?? '', gallery: urls };
    } catch {
      return { heroImage: fallback[0] ?? '', gallery: fallback };
    }
  }

  private async fetchPlaces(query: string) {
    const fallback = {
      famousPlaces: ['Heritage quarter', 'Main viewpoint', 'Old market district'],
      landmarks: ['City fort', 'Waterfront promenade', 'Iconic temple/church'],
      restaurants: ['Local thali house', 'Chef tasting restaurant', 'Rooftop dinner spot'],
      cafes: ['Specialty coffee bar', 'Artisan bakery cafe', 'Work-friendly cafe'],
      hiddenGems: ['Sunrise lookout', 'Neighborhood food lane', 'Crafts street']
    };
    if (!env.OPENTRIPMAP_API_KEY) return fallback;
    try {
      const url = new URL('https://api.opentripmap.com/0.1/en/places/geoname');
      const city = query.split(',')[0]?.trim() ?? query;
      url.searchParams.set('name', city);
      url.searchParams.set('apikey', env.OPENTRIPMAP_API_KEY);
      const geo = await fetch(url.toString());
      if (!geo.ok) return fallback;
      return fallback;
    } catch {
      return fallback;
    }
  }

  private estimateWeather(bestSeason?: string) {
    const season = bestSeason?.toLowerCase() ?? '';
    if (season.includes('dec') || season.includes('jan')) {
      return { summary: 'Cool and crisp with clear mornings.', avgTempC: '10-22', rainChance: 'Low' };
    }
    if (season.includes('jun') || season.includes('monsoon')) {
      return { summary: 'Humid with frequent showers.', avgTempC: '22-31', rainChance: 'High' };
    }
    return { summary: 'Pleasant travel weather for city exploration.', avgTempC: '18-30', rainChance: 'Medium' };
  }

  private estimateBudget(costIndex: string) {
    if (costIndex === 'high') return { budget: 14000, comfort: 22000, premium: 36000 };
    if (costIndex === 'low') return { budget: 3500, comfort: 8000, premium: 18000 };
    return { budget: 6000, comfort: 12000, premium: 24000 };
  }

  private generateFallbackTransport(query: TransportSearchQueryDto) {
    const modes = query.mode === 'all' ? ['flight', 'train', 'bus'] : [query.mode];
    return modes.flatMap((mode, idx) => {
      const base = mode === 'flight' ? 7200 : mode === 'train' ? 1450 : 900;
      const duration = mode === 'flight' ? '2h 05m' : mode === 'train' ? '8h 20m' : '10h 10m';
      return [0, 1].map((slot) => ({
        id: `${mode}-${idx}-${slot}`,
        mode,
        operator: mode === 'flight' ? 'IndiGo / Air India' : mode === 'train' ? 'Indian Railways' : 'RedBus Partners',
        origin: query.origin,
        destination: query.destination,
        departureDate: query.departureDate,
        departureTime: slot === 0 ? '06:30' : '19:15',
        arrivalTime: slot === 0 ? '09:00' : '22:10',
        duration,
        estimatedPriceInr: base + slot * (mode === 'flight' ? 2100 : 550),
        routeSummary: `${query.origin} -> ${query.destination} (${mode})`
      }));
    });
  }
}

export const destinationsService = new DestinationsService();
