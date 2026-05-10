import type { Prisma, Stop } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class StopsRepository {
  public findByTripId(tripId: string): Promise<Stop[]> {
    return prisma.stop.findMany({ where: { tripId }, orderBy: { orderIndex: 'asc' } });
  }

  public findById(id: string): Promise<Stop | null> {
    return prisma.stop.findUnique({ where: { id } });
  }

  public create(data: Prisma.StopUncheckedCreateInput): Promise<Stop> {
    return prisma.stop.create({ data });
  }

  public update(id: string, data: Prisma.StopUncheckedUpdateInput): Promise<Stop> {
    return prisma.stop.update({ where: { id }, data });
  }

  public delete(id: string): Promise<Stop> {
    return prisma.stop.delete({ where: { id } });
  }

  public async reorder(stopOrders: Array<{ id: string; orderIndex: number }>): Promise<Stop[]> {
    await prisma.$transaction(
      stopOrders.map((stop) =>
        prisma.stop.update({ where: { id: stop.id }, data: { orderIndex: stop.orderIndex } })
      )
    );

    const ids = stopOrders.map((stop) => stop.id);
    return prisma.stop.findMany({ where: { id: { in: ids } }, orderBy: { orderIndex: 'asc' } });
  }
}

export const stopsRepository = new StopsRepository();
