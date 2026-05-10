require('dotenv/config');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const slugs = [
  'kashmir-luxury-from-vijayawada-demo',
  'hampi-gokarna-budget-from-vijayawada-demo',
  'meghalaya-friends-adventure-from-vijayawada-demo'
];

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'koushikt33@gmail.com' },
    include: {
      trips: {
        where: { publicSlug: { in: slugs } },
        include: {
          stops: { include: { stopActivities: true } },
          packingItems: true,
          tripNotes: true,
          mediaUploads: true
        },
        orderBy: { startDate: 'asc' }
      }
    }
  });

  console.log(JSON.stringify({
    user: user && {
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      styles: user.travelStyles
    },
    trips: user?.trips.map((trip) => ({
      title: trip.title,
      stops: trip.stops.length,
      activities: trip.stops.reduce((total, stop) => total + stop.stopActivities.length, 0),
      packing: trip.packingItems.length,
      notes: trip.tripNotes.length,
      media: trip.mediaUploads.length,
      documents: trip.mediaUploads.filter((media) => media.mediaType === 'document').length,
      public: trip.isPublic,
      budgetCapUsd: Number(trip.budgetCapUsd)
    }))
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
