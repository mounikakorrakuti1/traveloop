import type { Prisma, Trip } from '@prisma/client';
import { prisma } from '../../config/prisma';

type TripDetailPayload = Prisma.TripGetPayload<{
  include: {
    stops: {
      include: {
        city: true;
        stopActivities: { include: { activity: true } };
      };
    };
  };
}>;

export class TripsRepository {
  public findMany(args: Prisma.TripFindManyArgs): Promise<Trip[]> {
    return prisma.trip.findMany(args);
  }

  public count(where: Prisma.TripWhereInput): Promise<number> {
    return prisma.trip.count({ where });
  }

  public findOwnedById(id: string, userId: string): Promise<Trip | null> {
    return prisma.trip.findFirst({
      where: { id, userId, deletedAt: null }
    });
  }

  public findOwnedDetail(id: string, userId: string): Promise<TripDetailPayload | null> {
    return prisma.trip.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        stops: {
          include: {
            city: true,
            stopActivities: { include: { activity: true } }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  }

  public findPublicBySlug(slug: string): Promise<TripDetailPayload | null> {
    return prisma.trip.findFirst({
      where: { publicSlug: slug, isPublic: true, deletedAt: null },
      include: {
        stops: {
          include: {
            city: true,
            stopActivities: { include: { activity: true } }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });
  }

  public create(data: Prisma.TripUncheckedCreateInput): Promise<Trip> {
    return prisma.trip.create({ data });
  }

  public update(id: string, data: Prisma.TripUncheckedUpdateInput): Promise<Trip> {
    return prisma.trip.update({ where: { id }, data });
  }

  public softDelete(id: string): Promise<Trip> {
    return prisma.trip.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

export const tripsRepository = new TripsRepository();
