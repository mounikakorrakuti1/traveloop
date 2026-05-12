import type { City as PrismaCity } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/error-handler';
import { cacheTtl, getCached, setCached } from '../../services/travel/cache';
import { fallbackBudget, fallbackWeather } from '../../services/travel/fallbacks';
import {
  geoDbClient,
  openTripMapClient,
  openWeatherClient,
  unsplashClient,
  wikipediaClient
} from '../../services/travel/external-apis';
import type { NearbyQueryDto, TransportSearchQueryDto } from './destinations.dto';

type Coordinates = { latitude: number; longitude: number };
type JsonValue = unknown;
type DestinationEnrichment = {
  cityId: string;
  description: string | null;
  wikiUrl: string | null;
  heroImageUrl: string | null;
  gallery: JsonValue | null;
  attractions: JsonValue | null;
  weather: JsonValue | null;
  budgetEstimate: JsonValue | null;
  aiSummary: string | null;
  sourceMetadata: JsonValue | null;
};
type CityWithEnrichment = PrismaCity & { destinationEnrichment?: DestinationEnrichment | null };
type Attraction = { name: string; category: string; latitude: number | null; longitude: number | null; xid: string | null };

const parseMonthRange = (bestSeason?: string | null): string =>
  bestSeason && bestSeason.length > 0 ? bestSeason : 'October to March';

const toRad = (value: number): number => (value * Math.PI) / 180;
const distanceKm = (a: Coordinates, b: Coordinates): number => {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
};

const cityCoordinates = (city: PrismaCity): Coordinates => ({
  latitude: Number(city.latitude),
  longitude: Number(city.longitude)
});

const cityDedupeKey = (city: PrismaCity): string =>
  [city.name, city.state, city.country]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
    .join('|');

const uniqueCities = <T extends PrismaCity>(cities: T[]): T[] => {
  const seen = new Set<string>();
  return cities.filter((city) => {
    const key = cityDedupeKey(city);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export class DestinationsService {
  public async trending() {
    const cacheKey = 'destinations:trending';
    const cached = getCached<unknown>(cacheKey);
    if (cached) return cached;

    const cities = await prisma.city.findMany({
      take: 8,
      orderBy: [{ isRegionalGem: 'desc' }, { name: 'asc' }]
    });
    const unique = uniqueCities(cities);
    const enrichments = await this.getEnrichmentMap(unique.map((city) => city.id));

    const data = await Promise.all(
      unique.map((city) =>
        this.normalizedFromCity({ ...city, destinationEnrichment: enrichments.get(city.id) ?? null }, { light: true })
      )
    );
    return setCached(cacheKey, data, cacheTtl.medium);
  }

  public async getByName(name: string) {
    const cacheKey = `destination:name:${name.toLowerCase()}`;
    const cached = getCached<unknown>(cacheKey);
    if (cached) return cached;

    const city = await prisma.city.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { name: { contains: name, mode: 'insensitive' } }
        ]
      }
    });

    if (city) {
      const enrichment = await this.getEnrichment(city.id);
      return setCached(cacheKey, await this.normalizedFromCity({ ...city, destinationEnrichment: enrichment }), cacheTtl.medium);
    }

    const geo = await geoDbClient.city(name);
    const coords = geo ? { latitude: geo.latitude, longitude: geo.longitude } : undefined;
    const [wiki, images, weather, attractions] = await Promise.all([
      wikipediaClient.summary(name),
      unsplashClient.images(name),
      openWeatherClient.current(name, coords),
      openTripMapClient.attractions(name, coords)
    ]);

    return setCached(
      cacheKey,
      {
        id: null,
        name: geo?.name ?? name,
        country: geo?.country ?? 'Unknown',
        state: geo?.region ?? null,
        coordinates: coords ?? null,
        description: wiki.description ?? `A travel destination profile for ${name}, enriched from available public sources.`,
        image: images.image,
        gallery: images.gallery,
        weather,
        topAttractions: attractions,
        budgetEstimate: fallbackBudget(),
        bestSeason: 'Year-round, confirm weather before booking',
        aiSummary: this.buildAiSummary(name, weather.condition, attractions.map((item) => item.name)),
        sources: {
          description: wiki.url ? 'wikipedia' : 'fallback',
          images: images.source,
          weather: weather.source,
          attractions: attractions.some((item) => item.xid) ? 'opentripmap' : 'fallback'
        }
      },
      cacheTtl.medium
    );
  }

  public async weather(city: string) {
    const dbCity = await prisma.city.findFirst({
      where: { name: { equals: city, mode: 'insensitive' } }
    });
    const enrichment = dbCity ? await this.getEnrichment(dbCity.id) : null;
    if (enrichment?.weather) {
      return enrichment.weather;
    }
    return openWeatherClient.current(city, dbCity ? cityCoordinates(dbCity) : undefined, dbCity?.bestSeason);
  }

  public async nearby(query: NearbyQueryDto) {
    const origin = { latitude: query.lat, longitude: query.lon };
    const cities = await prisma.city.findMany({ take: 500 });
    const unique = uniqueCities(cities);
    const enrichments = await this.getEnrichmentMap(unique.map((city) => city.id));
    const nearbyCities = unique
      .map((city) => ({ city, km: distanceKm(origin, cityCoordinates(city)) }))
      .filter((item) => item.km <= query.radiusKm)
      .sort((a, b) => a.km - b.km)
      .slice(0, 8);

    const normalized = await Promise.all(
      nearbyCities.map(async ({ city, km }) => ({
        ...(await this.normalizedFromCity({ ...city, destinationEnrichment: enrichments.get(city.id) ?? null }, { light: true })),
        distanceKm: Math.round(km)
      }))
    );
    return { origin, radiusKm: query.radiusKm, destinations: normalized };
  }

  public async getIntelligence(cityId: string) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) throw new AppError('Destination not found', 'NOT_FOUND', 404);

    const normalized = await this.normalizedFromCity({ ...city, destinationEnrichment: await this.getEnrichment(city.id) });
    return {
      city: {
        id: city.id,
        name: city.name,
        country: city.country,
        state: city.state,
        bestSeason: city.bestSeason
      },
      heroImage: normalized.image,
      gallery: normalized.gallery,
      famousPlaces: normalized.topAttractions.map((item) => item.name).slice(0, 5),
      landmarks: normalized.topAttractions.filter((item) => item.category.includes('historic')).map((item) => item.name),
      restaurants: ['Local thali house', 'Chef tasting restaurant', 'Rooftop dinner spot'],
      cafes: ['Specialty coffee bar', 'Artisan bakery cafe', 'Work-friendly cafe'],
      hiddenGems: normalized.topAttractions.slice(3, 6).map((item) => item.name),
      weather: {
        summary: normalized.weather.condition,
        avgTempC: String(normalized.weather.temp),
        rainChance: normalized.weather.humidity ? `${normalized.weather.humidity}% humidity` : 'Check forecast'
      },
      bestTimeToVisit: normalized.bestSeason,
      estimatedBudgetInr: {
        budget: normalized.budgetEstimate.budget,
        comfort: normalized.budgetEstimate.comfort,
        premium: normalized.budgetEstimate.luxury
      },
      safetyTips: [
        'Prefer registered cabs after 9 PM and keep hotel contact pinned.',
        'Store a digital copy of ID and bookings in your trip documents.',
        'Carry UPI and one backup card, especially for hill/coastal transfers.'
      ],
      transportationTips: [
        'Compare flight, train, and road options before locking dates.',
        'Book airport or station transfer 12-24 hours ahead in peak season.',
        'Start day trips early to avoid traffic and attraction queues.'
      ],
      normalized
    };
  }

  public async searchTransport(query: TransportSearchQueryDto) {
    const cacheKey = `transport:${JSON.stringify(query)}`;
    const cached = getCached<unknown>(cacheKey);
    if (cached) return cached;

    const fallback = this.generateFallbackTransport(query);
    return setCached(cacheKey, { options: fallback, provider: 'fallback-demo' }, cacheTtl.short);
  }

  public async refreshStoredEnrichment(cityId: string) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) throw new AppError('Destination not found', 'NOT_FOUND', 404);
    const normalized = await this.normalizedFromCity(city, { forceLive: true });
    await prisma.$executeRaw`
      INSERT INTO destination_enrichments (
        city_id, description, hero_image_url, gallery, attractions, weather, budget_estimate, ai_summary, source_metadata, refreshed_at, updated_at
      )
      VALUES (
        ${city.id}::uuid,
        ${normalized.description},
        ${normalized.image},
        ${JSON.stringify(normalized.gallery)}::jsonb,
        ${JSON.stringify(normalized.topAttractions)}::jsonb,
        ${JSON.stringify(normalized.weather)}::jsonb,
        ${JSON.stringify(normalized.budgetEstimate)}::jsonb,
        ${normalized.aiSummary},
        ${JSON.stringify(normalized.sources)}::jsonb,
        NOW(),
        NOW()
      )
      ON CONFLICT (city_id) DO UPDATE SET
        description = EXCLUDED.description,
        hero_image_url = EXCLUDED.hero_image_url,
        gallery = EXCLUDED.gallery,
        attractions = EXCLUDED.attractions,
        weather = EXCLUDED.weather,
        budget_estimate = EXCLUDED.budget_estimate,
        ai_summary = EXCLUDED.ai_summary,
        source_metadata = EXCLUDED.source_metadata,
        refreshed_at = NOW(),
        updated_at = NOW()
    `;
    return normalized;
  }

  private async getEnrichment(cityId: string): Promise<DestinationEnrichment | null> {
    const rows = await this.getEnrichments([cityId]);
    return rows[0] ?? null;
  }

  private async getEnrichmentMap(cityIds: string[]): Promise<Map<string, DestinationEnrichment>> {
    const rows = await this.getEnrichments(cityIds);
    return new Map(rows.map((row) => [row.cityId, row]));
  }

  private async getEnrichments(cityIds: string[]): Promise<DestinationEnrichment[]> {
    if (cityIds.length === 0) return [];
    try {
      return await prisma.$queryRaw<DestinationEnrichment[]>`
        SELECT
          city_id AS "cityId",
          description,
          wiki_url AS "wikiUrl",
          hero_image_url AS "heroImageUrl",
          gallery,
          attractions,
          weather,
          budget_estimate AS "budgetEstimate",
          ai_summary AS "aiSummary",
          source_metadata AS "sourceMetadata"
        FROM destination_enrichments
        WHERE city_id = ANY(${cityIds}::uuid[])
      `;
    } catch {
      return [];
    }
  }

  private async normalizedFromCity(city: CityWithEnrichment, options?: { light?: boolean; forceLive?: boolean }) {
    const coords = cityCoordinates(city);
    const query = `${city.name}, ${city.country}`;
    const stored = options?.forceLive ? null : city.destinationEnrichment;
    const storedGallery = jsonArray<string>(stored?.gallery);
    const storedAttractions = jsonArray<Attraction>(stored?.attractions);
    const storedWeather = jsonObject<Awaited<ReturnType<typeof openWeatherClient.current>>>(stored?.weather);
    const storedBudget = jsonObject<ReturnType<typeof fallbackBudget>>(stored?.budgetEstimate);
    if (stored && options?.light) {
      return {
        id: city.id,
        name: city.name,
        country: city.country,
        state: city.state,
        coordinates: coords,
        description: stored.description ?? `${city.name} is a ${city.areaType ?? 'travel'} destination in ${city.country}.`,
        image: stored.heroImageUrl || city.thumbnailUrl || '',
        gallery: storedGallery.length > 0 ? storedGallery : [stored.heroImageUrl || city.thumbnailUrl || ''].filter(Boolean),
        weather: storedWeather ?? fallbackWeather(city.bestSeason),
        topAttractions: storedAttractions,
        budgetEstimate: storedBudget ?? fallbackBudget(city.costIndex),
        bestSeason: parseMonthRange(city.bestSeason),
        aiSummary: stored.aiSummary ?? this.buildAiSummary(city.name, (storedWeather ?? fallbackWeather(city.bestSeason)).condition, storedAttractions.map((item) => item.name)),
        sources: jsonObject<Record<string, string>>(stored.sourceMetadata) ?? {
          description: stored.description ? 'stored' : 'database',
          images: stored.heroImageUrl ? 'stored' : 'fallback',
          weather: storedWeather ? 'stored' : 'seasonal-fallback',
          attractions: storedAttractions.length > 0 ? 'stored' : 'fallback'
        }
      };
    }

    const [wiki, images, weather, attractions] = await Promise.all([
      stored?.description ? Promise.resolve({ description: stored.description, url: stored.wikiUrl }) : options?.light ? Promise.resolve({ description: null, url: null }) : wikipediaClient.summary(city.name),
      stored?.heroImageUrl ? Promise.resolve({ image: stored.heroImageUrl, gallery: storedGallery, source: 'stored' }) : unsplashClient.images(query),
      storedWeather ? Promise.resolve(storedWeather) : openWeatherClient.current(city.name, coords, city.bestSeason),
      storedAttractions.length > 0 ? Promise.resolve(storedAttractions) : options?.light ? Promise.resolve([]) : openTripMapClient.attractions(city.name, coords)
    ]);
    const topAttractions = attractions.length > 0 ? attractions : await openTripMapClient.attractions(city.name, coords);

    return {
      id: city.id,
      name: city.name,
      country: city.country,
      state: city.state,
      coordinates: coords,
      description: wiki.description ?? `${city.name} is a ${city.areaType ?? 'travel'} destination in ${city.country}.`,
      image: images.image || city.thumbnailUrl || '',
      gallery: images.gallery,
      weather,
      topAttractions,
      budgetEstimate: storedBudget ?? fallbackBudget(city.costIndex),
      bestSeason: parseMonthRange(city.bestSeason),
      aiSummary: this.buildAiSummary(city.name, weather.condition, topAttractions.map((item) => item.name)),
      sources: {
        description: stored?.description ? 'stored' : wiki.url ? 'wikipedia' : 'database',
        images: images.source,
        weather: weather.source ?? fallbackWeather(city.bestSeason).source,
        attractions: topAttractions.some((item) => item.xid) ? 'opentripmap' : 'fallback'
      }
    };
  }

  private buildAiSummary(name: string, weatherCondition: string, attractionNames: string[]) {
    const attractions = attractionNames.slice(0, 3).join(', ') || 'local neighborhoods';
    return `${name} is currently best approached with ${weatherCondition.toLowerCase()} in mind. Prioritize ${attractions}, then leave room for food walks and slower local experiences.`;
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

const jsonArray = <T>(value: JsonValue | null | undefined): T[] => (Array.isArray(value) ? (value as T[]) : []);

const jsonObject = <T>(value: JsonValue | null | undefined): T | null =>
  value && !Array.isArray(value) && typeof value === 'object' ? (value as T) : null;

export const destinationsService = new DestinationsService();
