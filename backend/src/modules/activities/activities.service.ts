import type {
  Activity as PrismaActivity,
  Prisma,
  StopActivity as PrismaStopActivity
} from '@prisma/client';
import type { Activity, PaginationMeta, StopActivity } from '../../../shared/types';
import { AppError } from '../../middleware/error-handler';
import { paginate } from '../../utils/paginate';
import { stopsRepository } from '../stops/stops.repository';
import { tripsRepository } from '../trips/trips.repository';
import { activitiesRepository } from './activities.repository';
import type { AssignActivityDto, ListActivitiesQueryDto } from './activities.dto';

interface ActivityListResult {
  data: Activity[];
  meta: PaginationMeta;
}

export const mapActivity = (activity: PrismaActivity): Activity => ({
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

const mapStopActivity = (stopActivity: PrismaStopActivity): StopActivity => ({
  id: stopActivity.id,
  stopId: stopActivity.stopId,
  activityId: stopActivity.activityId,
  scheduledTime: stopActivity.scheduledTime?.toISOString() ?? null,
  actualCostUsd: stopActivity.actualCostUsd ? Number(stopActivity.actualCostUsd) : null,
  isCompleted: stopActivity.isCompleted
});

export class ActivitiesService {
  public async list(query: ListActivitiesQueryDto): Promise<ActivityListResult> {
    const pagination = paginate(query);
    const where: Prisma.ActivityWhereInput = {};
    if (query.cityId) where.cityId = query.cityId;
    if (query.category) where.category = query.category;
    if (query.maxCost !== undefined) where.estimatedCostUsd = { lte: query.maxCost };
    if (query.q) where.name = { contains: query.q, mode: 'insensitive' };

    const [activities, total] = await Promise.all([
      activitiesRepository.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { name: 'asc' }
      }),
      activitiesRepository.count(where)
    ]);

    const filtered = query.tripType
      ? activities.filter((activity) => {
          const tags = Array.isArray(activity.tripTypeTags) ? activity.tripTypeTags.map(String) : [];
          return tags.includes(query.tripType ?? '');
        })
      : activities;

    return {
      data: filtered.map(mapActivity),
      meta: { total, page: pagination.page, limit: pagination.limit }
    };
  }

  public async getById(id: string): Promise<Activity> {
    const activity = await activitiesRepository.findById(id);
    if (!activity) {
      throw new AppError('Activity not found', 'NOT_FOUND', 404);
    }

    return mapActivity(activity);
  }

  public async assignToStop(
    userId: string,
    tripId: string,
    stopId: string,
    dto: AssignActivityDto
  ): Promise<StopActivity> {
    await this.assertTripAndStopOwnership(userId, tripId, stopId);

    const activity = await activitiesRepository.findById(dto.activityId);
    if (!activity) {
      throw new AppError('Activity not found', 'NOT_FOUND', 404);
    }

    const data: Prisma.StopActivityUncheckedCreateInput = {
      stopId,
      activityId: dto.activityId
    };
    if (dto.scheduledTime) data.scheduledTime = new Date(`1970-01-01T${dto.scheduledTime}`);
    if (dto.actualCostUsd !== undefined) data.actualCostUsd = dto.actualCostUsd;

    const stopActivity = await activitiesRepository.createStopActivity(data);

    return mapStopActivity(stopActivity);
  }

  public async removeFromStop(userId: string, tripId: string, stopId: string, saId: string): Promise<void> {
    await this.assertTripAndStopOwnership(userId, tripId, stopId);
    await activitiesRepository.deleteStopActivity(saId);
  }

  private async assertTripAndStopOwnership(
    userId: string,
    tripId: string,
    stopId: string
  ): Promise<void> {
    const trip = await tripsRepository.findOwnedById(tripId, userId);
    if (!trip) {
      throw new AppError('Trip not found', 'NOT_FOUND', 404);
    }

    const stop = await stopsRepository.findById(stopId);
    if (!stop || stop.tripId !== tripId) {
      throw new AppError('Stop not found', 'NOT_FOUND', 404);
    }
  }
}

export const activitiesService = new ActivitiesService();
