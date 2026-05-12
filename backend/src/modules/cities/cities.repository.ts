import type { City, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class CitiesRepository {
  public findMany(args: Prisma.CityFindManyArgs): Promise<City[]> {
    return prisma.city.findMany(args);
  }

  public count(where: Prisma.CityWhereInput): Promise<number> {
    return prisma.city.count({ where });
  }

  public findById(id: string) {
    return prisma.city.findUnique({
      where: { id },
      include: { activities: true }
    });
  }

  public async rawDestinationEnrichments(cityIds: string[]) {
    try {
      return await prisma.$queryRaw<
        Array<{
          cityId: string;
          description: string | null;
          heroImageUrl: string | null;
          weather: unknown;
          attractions: unknown;
          aiSummary: string | null;
        }>
      >`
        SELECT
          city_id AS "cityId",
          description,
          hero_image_url AS "heroImageUrl",
          weather,
          attractions,
          ai_summary AS "aiSummary"
        FROM destination_enrichments
        WHERE city_id = ANY(${cityIds}::uuid[])
      `;
    } catch {
      return [];
    }
  }
}

export const citiesRepository = new CitiesRepository();
