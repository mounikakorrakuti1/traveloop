import type {
  Activity as PrismaActivity,
  City as PrismaCity,
  Stop as PrismaStop,
  StopActivity as PrismaStopActivity,
  Prisma,
  Trip as PrismaTrip
} from '@prisma/client';
import type {
  BudgetSummary,
  BudgetVibe,
  CostIndex,
  PaginationMeta,
  Stop,
  StopActivity,
  Trip,
  TripStatus,
  TripType
} from '../../../shared/types';
import { AppError } from '../../middleware/error-handler';
import { paginate } from '../../utils/paginate';
import { createSlug } from '../../utils/slugify';
import { mapActivity } from '../activities/activities.service';
import { tripsRepository } from './trips.repository';
import type { CreateTripDto, ListTripsQueryDto, PublishTripDto, UpdateTripDto } from './trips.dto';

interface TripListResult {
  data: Trip[];
  meta: PaginationMeta;
}

type TripDetail = PrismaTrip & {
  stops: Array<
    PrismaStop & {
      city: PrismaCity;
      stopActivities: Array<PrismaStopActivity & { activity: PrismaActivity }>;
    }
  >;
};

export const mapTrip = (trip: PrismaTrip): Trip => ({
  id: trip.id,
  userId: trip.userId,
  title: trip.title,
  description: trip.description,
  coverPhotoUrl: trip.coverPhotoUrl,
  startDate: trip.startDate.toISOString().slice(0, 10),
  endDate: trip.endDate.toISOString().slice(0, 10),
  tripType: trip.tripType as TripType,
  budgetCapUsd: trip.budgetCapUsd ? Number(trip.budgetCapUsd) : null,
  vibe: trip.vibe as BudgetVibe | null,
  isPublic: trip.isPublic,
  publicSlug: trip.publicSlug,
  status: trip.status as TripStatus,
  createdAt: trip.createdAt.toISOString(),
  updatedAt: trip.updatedAt.toISOString()
});

const mapStopActivity = (
  stopActivity: PrismaStopActivity & { activity: PrismaActivity }
): StopActivity => ({
  id: stopActivity.id,
  stopId: stopActivity.stopId,
  activityId: stopActivity.activityId,
  scheduledTime: stopActivity.scheduledTime?.toISOString() ?? null,
  actualCostUsd: stopActivity.actualCostUsd ? Number(stopActivity.actualCostUsd) : null,
  isCompleted: stopActivity.isCompleted,
  activity: mapActivity(stopActivity.activity)
});

const mapStop = (
  stop: PrismaStop & {
    city: PrismaCity;
    stopActivities: Array<PrismaStopActivity & { activity: PrismaActivity }>;
  }
): Stop => ({
  id: stop.id,
  tripId: stop.tripId,
  cityId: stop.cityId,
  orderIndex: stop.orderIndex,
  arrivalDate: stop.arrivalDate.toISOString().slice(0, 10),
  departureDate: stop.departureDate.toISOString().slice(0, 10),
  notes: stop.notes,
  accommodationName: stop.accommodationName,
  accommodationCost: stop.accommodationCost ? Number(stop.accommodationCost) : null,
  city: {
    id: stop.city.id,
    name: stop.city.name,
    state: stop.city.state,
    country: stop.city.country,
    countryCode: stop.city.countryCode,
    latitude: Number(stop.city.latitude),
    longitude: Number(stop.city.longitude),
    costIndex: stop.city.costIndex as CostIndex | null,
    areaType: stop.city.areaType,
    bestSeason: stop.city.bestSeason,
    isRegionalGem: stop.city.isRegionalGem,
    thumbnailUrl: stop.city.thumbnailUrl
  },
  activities: stop.stopActivities.map(mapStopActivity)
});

const mapTripDetail = (trip: TripDetail): Trip => ({
  ...mapTrip(trip),
  stops: trip.stops.map(mapStop)
});

const assertDateRange = (startDate: Date, endDate: Date): void => {
  if (endDate < startDate) {
    throw new AppError('endDate must be on or after startDate', 'VALIDATION_ERROR', 400, {
      endDate: ['endDate must be on or after startDate']
    });
  }
};

export class TripsService {
  public async list(userId: string, query: ListTripsQueryDto): Promise<TripListResult> {
    const pagination = paginate(query);
    const where: Prisma.TripWhereInput = {
      userId,
      deletedAt: null
    };
    if (query.status) where.status = query.status;
    if (query.search) where.title = { contains: query.search, mode: 'insensitive' };

    const [trips, total] = await Promise.all([
      tripsRepository.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { [query.sort]: 'desc' }
      }),
      tripsRepository.count(where)
    ]);

    return {
      data: trips.map(mapTrip),
      meta: { total, page: pagination.page, limit: pagination.limit }
    };
  }

  public async create(userId: string, dto: CreateTripDto): Promise<Trip> {
    const data: Prisma.TripUncheckedCreateInput = {
      userId,
      title: dto.title,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      tripType: dto.tripType
    };
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.coverPhotoUrl !== undefined) data.coverPhotoUrl = dto.coverPhotoUrl;
    if (dto.budgetCapUsd !== undefined) data.budgetCapUsd = dto.budgetCapUsd;
    if (dto.vibe !== undefined) data.vibe = dto.vibe;

    const trip = await tripsRepository.create(data);

    return mapTrip(trip);
  }

  public async getById(userId: string, id: string): Promise<Trip> {
    const trip = (await tripsRepository.findOwnedDetail(id, userId)) as TripDetail | null;
    if (!trip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }

    return mapTripDetail(trip);
  }

  public async update(userId: string, id: string, dto: UpdateTripDto): Promise<Trip> {
    const existingTrip = await tripsRepository.findOwnedById(id, userId);
    if (!existingTrip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }

    const nextStartDate = dto.startDate ? new Date(dto.startDate) : existingTrip.startDate;
    const nextEndDate = dto.endDate ? new Date(dto.endDate) : existingTrip.endDate;
    assertDateRange(nextStartDate, nextEndDate);

    const data: Prisma.TripUncheckedUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.coverPhotoUrl !== undefined) data.coverPhotoUrl = dto.coverPhotoUrl;
    if (dto.startDate !== undefined) data.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) data.endDate = new Date(dto.endDate);
    if (dto.tripType !== undefined) data.tripType = dto.tripType;
    if (dto.budgetCapUsd !== undefined) data.budgetCapUsd = dto.budgetCapUsd;
    if (dto.vibe !== undefined) data.vibe = dto.vibe;
    if (dto.status !== undefined) data.status = dto.status;

    const trip = await tripsRepository.update(id, data);

    return mapTrip(trip);
  }

  public async delete(userId: string, id: string): Promise<void> {
    const existingTrip = await tripsRepository.findOwnedById(id, userId);
    if (!existingTrip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }

    await tripsRepository.softDelete(id);
  }

  public async publish(userId: string, id: string, dto: PublishTripDto): Promise<{ publicSlug: string | null }> {
    const existingTrip = await tripsRepository.findOwnedById(id, userId);
    if (!existingTrip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }

    const publicSlug = dto.isPublic ? existingTrip.publicSlug ?? createSlug(existingTrip.title) : null;
    await tripsRepository.update(id, { isPublic: dto.isPublic, publicSlug });
    return { publicSlug };
  }

  public async budget(userId: string, id: string): Promise<BudgetSummary> {
    const trip = (await tripsRepository.findOwnedDetail(id, userId)) as TripDetail | null;
    if (!trip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }

    const byDay = trip.stops.map((stop) => {
      const accommodationCostUsd = stop.accommodationCost ? Number(stop.accommodationCost) : 0;
      const activitiesCostUsd = stop.stopActivities.reduce((total, stopActivity) => {
        const cost = stopActivity.actualCostUsd ?? stopActivity.activity.estimatedCostUsd;
        return total + Number(cost);
      }, 0);

      return {
        date: stop.arrivalDate.toISOString().slice(0, 10),
        stopId: stop.id,
        cityName: stop.city.name,
        accommodationCostUsd,
        activitiesCostUsd,
        totalUsd: accommodationCostUsd + activitiesCostUsd
      };
    });

    const categoryTotals = new Map<string, number>();
    for (const stop of trip.stops) {
      if (stop.accommodationCost) {
        categoryTotals.set(
          'accommodation',
          (categoryTotals.get('accommodation') ?? 0) + Number(stop.accommodationCost)
        );
      }
      for (const stopActivity of stop.stopActivities) {
        const cost = Number(stopActivity.actualCostUsd ?? stopActivity.activity.estimatedCostUsd);
        categoryTotals.set(
          stopActivity.activity.category,
          (categoryTotals.get(stopActivity.activity.category) ?? 0) + cost
        );
      }
    }

    const totalSpentUsd = byDay.reduce((total, day) => total + day.totalUsd, 0);
    const byCategory = Array.from(categoryTotals.entries()).map(([category, totalUsd]) => ({
      category,
      totalUsd,
      percentage: totalSpentUsd > 0 ? Math.round((totalUsd / totalSpentUsd) * 100) : 0
    }));
    const totalBudgetCapUsd = trip.budgetCapUsd ? Number(trip.budgetCapUsd) : null;

    return {
      tripId: trip.id,
      totalBudgetCapUsd,
      totalSpentUsd,
      byDay,
      byCategory,
      isOverBudget: totalBudgetCapUsd !== null && totalSpentUsd > totalBudgetCapUsd,
      remainingUsd: totalBudgetCapUsd === null ? null : totalBudgetCapUsd - totalSpentUsd
    };
  }
}

export const tripsService = new TripsService();
