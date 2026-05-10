import type { Activity, Prisma, StopActivity } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class ActivitiesRepository {
  public findMany(args: Prisma.ActivityFindManyArgs): Promise<Activity[]> {
    return prisma.activity.findMany(args);
  }

  public count(where: Prisma.ActivityWhereInput): Promise<number> {
    return prisma.activity.count({ where });
  }

  public findById(id: string): Promise<Activity | null> {
    return prisma.activity.findUnique({ where: { id } });
  }

  public createStopActivity(data: Prisma.StopActivityUncheckedCreateInput): Promise<StopActivity> {
    return prisma.stopActivity.create({ data });
  }

  public deleteStopActivity(id: string): Promise<StopActivity> {
    return prisma.stopActivity.delete({ where: { id } });
  }
}

export const activitiesRepository = new ActivitiesRepository();
