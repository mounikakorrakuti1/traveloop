import type { Activity as PrismaActivity, City as PrismaCity, Prisma } from '@prisma/client';
import type { Activity, City, CostIndex, PaginationMeta } from '../../../shared/types';
import { paginate } from '../../utils/paginate';
import { AppError } from '../../middleware/error-handler';
import { citiesRepository } from './cities.repository';
import type { ListCitiesQueryDto } from './cities.dto';

interface CityListResult {
  data: City[];
  meta: PaginationMeta;
}

type CityWithActivities = PrismaCity & { activities: PrismaActivity[]; destinationEnrichment?: DestinationEnrichment | null };
type CityWithEnrichment = PrismaCity & { destinationEnrichment?: DestinationEnrichment | null };
type DestinationEnrichment = {
  cityId: string;
  description: string | null;
  heroImageUrl: string | null;
  weather: unknown;
  attractions: unknown;
  aiSummary: string | null;
};

const mapCity = (city: CityWithEnrichment): City & {
  description?: string | null;
  image?: string | null;
  weather?: unknown;
  topAttractions?: unknown[];
  aiSummary?: string | null;
} => ({
  id: city.id,
  name: city.name,
  state: city.state,
  country: city.country,
  countryCode: city.countryCode,
  latitude: Number(city.latitude),
  longitude: Number(city.longitude),
  costIndex: city.costIndex as CostIndex | null,
  areaType: city.areaType,
  bestSeason: city.bestSeason,
  isRegionalGem: city.isRegionalGem,
  thumbnailUrl: city.destinationEnrichment?.heroImageUrl ?? city.thumbnailUrl,
  description: city.destinationEnrichment?.description ?? null,
  image: city.destinationEnrichment?.heroImageUrl ?? city.thumbnailUrl,
  weather: city.destinationEnrichment?.weather ?? null,
  topAttractions: Array.isArray(city.destinationEnrichment?.attractions)
    ? city.destinationEnrichment?.attractions.slice(0, 5)
    : [],
  aiSummary: city.destinationEnrichment?.aiSummary ?? null
});

const mapActivity = (activity: PrismaActivity): Activity => ({
  id: activity.id,
  cityId: activity.cityId,
  name: activity.name,
  category: activity.category,
  tripTypeTags: Array.isArray(activity.tripTypeTags) ? activity.tripTypeTags.map(String) : [],
  estimatedCostUsd: Number(activity.estimatedCostUsd),
  durationHours: Number(activity.durationHours),
  description: activity.description,
  imageUrl: activity.imageUrl
});

const cityDedupeKey = (city: PrismaCity): string =>
  [city.name, city.state, city.country]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase())
    .join('|');

const uniqueCities = (cities: PrismaCity[]): PrismaCity[] => {
  const seen = new Set<string>();
  return cities.filter((city) => {
    const key = cityDedupeKey(city);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export class CitiesService {
  public async list(query: ListCitiesQueryDto): Promise<CityListResult> {
    const pagination = paginate(query);
    const where: Prisma.CityWhereInput = {};
    if (query.country) where.country = { contains: query.country, mode: 'insensitive' };
    if (query.region) where.region = { contains: query.region, mode: 'insensitive' };
    if (query.costIndex) where.costIndex = query.costIndex;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { state: { contains: query.q, mode: 'insensitive' } },
        { country: { contains: query.q, mode: 'insensitive' } }
      ];
    }

    const [cities, total] = await Promise.all([
      citiesRepository.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: [{ isRegionalGem: 'desc' }, { name: 'asc' }]
      }),
      citiesRepository.count(where)
    ]);
    const unique = uniqueCities(cities);
    const enrichments = await this.getEnrichmentMap(unique.map((city) => city.id));

    return {
      data: unique.map((city) => mapCity({ ...city, destinationEnrichment: enrichments.get(city.id) ?? null })),
      meta: { total, page: pagination.page, limit: pagination.limit }
    };
  }

  public async getById(id: string): Promise<City & { activities: Activity[] }> {
    const city = (await citiesRepository.findById(id)) as CityWithActivities | null;
    if (!city) {
      throw new AppError('City not found', 'NOT_FOUND', 404);
    }

    return {
      ...mapCity({ ...city, destinationEnrichment: await this.getEnrichment(city.id) }),
      activities: city.activities.map(mapActivity)
    };
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
    return citiesRepository.rawDestinationEnrichments(cityIds);
  }
}

export const citiesService = new CitiesService();
