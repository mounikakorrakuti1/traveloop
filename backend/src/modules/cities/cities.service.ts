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

type CityWithActivities = PrismaCity & { activities: PrismaActivity[] };

const mapCity = (city: PrismaCity): City => ({
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
  thumbnailUrl: city.thumbnailUrl
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

    return {
      data: cities.map(mapCity),
      meta: { total, page: pagination.page, limit: pagination.limit }
    };
  }

  public async getById(id: string): Promise<City & { activities: Activity[] }> {
    const city = (await citiesRepository.findById(id)) as CityWithActivities | null;
    if (!city) {
      throw new AppError('City not found', 'NOT_FOUND', 404);
    }

    return {
      ...mapCity(city),
      activities: city.activities.map(mapActivity)
    };
  }
}

export const citiesService = new CitiesService();
