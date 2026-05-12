import { prisma } from '../src/config/prisma';
import { destinationsService } from '../src/modules/destinations/destinations.service';

const limit = Number(process.env.ENRICH_LIMIT ?? 25);

const main = async (): Promise<void> => {
  const cities = await prisma.city.findMany({
    take: limit,
    orderBy: [{ isRegionalGem: 'desc' }, { name: 'asc' }],
    select: { id: true, name: true, country: true }
  });

  for (const city of cities) {
    process.stdout.write(`Enriching ${city.name}, ${city.country}... `);
    await destinationsService.refreshStoredEnrichment(city.id);
    process.stdout.write('done\n');
  }
};

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
