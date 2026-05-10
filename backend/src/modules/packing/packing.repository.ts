import type { PackingItem, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class PackingRepository {
  public findByTripId(tripId: string): Promise<PackingItem[]> {
    return prisma.packingItem.findMany({ where: { tripId }, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  }

  public findById(id: string): Promise<PackingItem | null> {
    return prisma.packingItem.findUnique({ where: { id } });
  }

  public create(data: Prisma.PackingItemUncheckedCreateInput): Promise<PackingItem> {
    return prisma.packingItem.create({ data });
  }

  public createMany(data: Prisma.PackingItemCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.packingItem.createMany({ data });
  }

  public update(id: string, data: Prisma.PackingItemUncheckedUpdateInput): Promise<PackingItem> {
    return prisma.packingItem.update({ where: { id }, data });
  }

  public delete(id: string): Promise<PackingItem> {
    return prisma.packingItem.delete({ where: { id } });
  }
}

export const packingRepository = new PackingRepository();
