import type { Activity, City, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class CitiesRepository {
  public findMany(args: Prisma.CityFindManyArgs): Promise<City[]> {
    return prisma.city.findMany(args);
  }

  public count(where: Prisma.CityWhereInput): Promise<number> {
    return prisma.city.count({ where });
  }

  public findById(id: string): Promise<(City & { activities: Activity[] }) | null> {
    return prisma.city.findUnique({
      where: { id },
      include: { activities: true }
    });
  }
}

export const citiesRepository = new CitiesRepository();
