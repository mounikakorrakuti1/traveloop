import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_EMAIL = 'koushikt33@gmail.com';
const DEMO_PASSWORD = 'Traveloop@2026';

/** Unsplash Source URLs are deprecated; use stable images.unsplash.com links. */
const STABLE_TRIP_IMAGES = [
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1400&q=80',
  'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=1400&q=80',
  'https://images.unsplash.com/photo-1590050751759-db52da741c41?w=1400&q=80',
  'https://images.unsplash.com/photo-1592639296346-560c37a0f711?w=1400&q=80'
] as const;

/** Wikimedia Commons — stable, location-accurate hero URLs for seeded cities. */
const CITY_COVER: Record<string, string> = {
  Vijayawada: 'https://images.unsplash.com/photo-1590766740616-1ced2bb43f3e?w=1400&q=80',
  Srinagar: 'https://images.unsplash.com/photo-1597074866923-dc0589150458?w=1400&q=80',
  Gulmarg:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Ancient_Temple%2C_Gulmarg.jpg/960px-Ancient_Temple%2C_Gulmarg.jpg',
  Pahalgam: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1400&q=80',
  Hampi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg/960px-Wide_angle_of_Galigopuram_of_Virupaksha_Temple%2C_Hampi_%2804%29_%28cropped%29.jpg',
  Gokarna: 'https://images.unsplash.com/photo-1590766940554-634853c6e181?w=1400&q=80',
  Shillong:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Elephant_Falls_II%2C_Shillong.jpg/960px-Elephant_Falls_II%2C_Shillong.jpg',
  Cherrapunji: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Cherrapunji.jpg/960px-Cherrapunji.jpg',
  Dawki: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Umngot_river%2C_Dawki.jpg/960px-Umngot_river%2C_Dawki.jpg'
};

const INR_PER_USD_SEED = 83;

function pickImg(seed: string): string {
  const h = seed.split('').reduce((acc, ch) => ch.charCodeAt(0) + ((acc << 5) - acc), 0);
  return STABLE_TRIP_IMAGES[Math.abs(h) % STABLE_TRIP_IMAGES.length] ?? STABLE_TRIP_IMAGES[0];
}

function cityCover(name: string): string {
  return CITY_COVER[name] ?? pickImg(name);
}

const docUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const cities = [
  ['90000000-0000-4000-8000-000000000001', 'Vijayawada', 'Andhra Pradesh', 'India', 'IN', 16.5062, 80.6480, 'medium', 'city', 'Oct-Feb', false, 'Andhra Pradesh', cityCover('Vijayawada')],
  ['90000000-0000-4000-8000-000000000002', 'Srinagar', 'Jammu and Kashmir', 'India', 'IN', 34.0837, 74.7973, 'high', 'lake', 'Mar-Oct', false, 'Kashmir', cityCover('Srinagar')],
  ['90000000-0000-4000-8000-000000000003', 'Gulmarg', 'Jammu and Kashmir', 'India', 'IN', 34.0484, 74.3805, 'high', 'mountain', 'Dec-Mar', true, 'Kashmir', cityCover('Gulmarg')],
  ['90000000-0000-4000-8000-000000000004', 'Pahalgam', 'Jammu and Kashmir', 'India', 'IN', 34.0153, 75.3189, 'high', 'valley', 'Apr-Oct', true, 'Kashmir', cityCover('Pahalgam')],
  ['90000000-0000-4000-8000-000000000005', 'Hampi', 'Karnataka', 'India', 'IN', 15.3350, 76.4600, 'low', 'heritage', 'Nov-Feb', true, 'Karnataka', cityCover('Hampi')],
  ['90000000-0000-4000-8000-000000000006', 'Gokarna', 'Karnataka', 'India', 'IN', 14.5479, 74.3188, 'low', 'coastal', 'Oct-Mar', true, 'Karnataka', cityCover('Gokarna')],
  ['90000000-0000-4000-8000-000000000007', 'Shillong', 'Meghalaya', 'India', 'IN', 25.5788, 91.8933, 'medium', 'hill', 'Oct-May', false, 'North East India', cityCover('Shillong')],
  ['90000000-0000-4000-8000-000000000008', 'Cherrapunji', 'Meghalaya', 'India', 'IN', 25.2702, 91.7323, 'medium', 'rainforest', 'Oct-May', true, 'North East India', cityCover('Cherrapunji')],
  ['90000000-0000-4000-8000-000000000009', 'Dawki', 'Meghalaya', 'India', 'IN', 25.1847, 92.0173, 'medium', 'river', 'Nov-Apr', true, 'North East India', cityCover('Dawki')]
] as const;

const activities = [
  ['91000000-0000-4000-8000-000000000001', 1, 'Dal Lake private shikara at golden hour', 'sightseeing', 4200, 2, 'Quiet shikara route with saffron kahwa, floating market stop, and photographer-friendly light.', pickImg('Dal Lake private shikara at golden hour')],
  ['91000000-0000-4000-8000-000000000002', 1, 'Old Srinagar food and craft trail', 'food', 3600, 3, 'Wazwan tasting, papier-mache workshop, spice market walk, and local bakery stop.', pickImg('Old Srinagar food and craft trail')],
  ['91000000-0000-4000-8000-000000000003', 2, 'Gulmarg gondola and snow meadow loop', 'adventure', 9200, 5, 'Phase 1 gondola, meadow walk, optional snow bike, and warm lunch window.', pickImg('Gulmarg gondola and snow meadow loop')],
  ['91000000-0000-4000-8000-000000000004', 2, 'Boutique ski lodge dinner', 'food', 6500, 2.5, 'Reservation-led dinner with Kashmiri rogan josh, kahwa, and driver pickup.', pickImg('Boutique ski lodge dinner')],
  ['91000000-0000-4000-8000-000000000005', 3, 'Betaab Valley and Aru Valley private circuit', 'nature', 7800, 6, 'Driver-led valley circuit with river picnic, pony-free walking trail, and weather fallback.', pickImg('Betaab Valley and Aru Valley private circuit')],
  ['91000000-0000-4000-8000-000000000006', 3, 'Lidder riverside cafe evening', 'food', 2800, 2, 'Slow evening by the river with trout dinner, tea, and next-day departure buffer.', pickImg('Lidder riverside cafe evening')],
  ['91000000-0000-4000-8000-000000000007', 4, 'Virupaksha sunrise and boulder viewpoint', 'sightseeing', 450, 2.5, 'Low-cost sunrise route from the bazaar with temple darshan and Matanga Hill viewpoint.', pickImg('Virupaksha sunrise and boulder viewpoint')],
  ['91000000-0000-4000-8000-000000000008', 4, 'Coracle ride and ruins cycling loop', 'adventure', 900, 4, 'Cycle rental, Tungabhadra coracle ride, Lotus Mahal, and stepwell route.', pickImg('Coracle ride and ruins cycling loop')],
  ['91000000-0000-4000-8000-000000000009', 5, 'Om Beach surf lesson and cafe crawl', 'adventure', 1800, 3, 'Beginner surf lesson, beach hop, and sunset cafe table with charging points.', pickImg('Om Beach surf lesson and cafe crawl')],
  ['91000000-0000-4000-8000-000000000010', 5, 'Half Moon Beach hike', 'nature', 650, 3.5, 'Guided coastal walk with ferry return option, snack stop, and offline map pin.', pickImg('Half Moon Beach hike')],
  ['91000000-0000-4000-8000-000000000011', 6, 'Shillong cafe, music, and Ward Lake evening', 'cultural', 2200, 3, 'Police Bazaar check-in, local cafe crawl, indie music stop, and relaxed lake walk.', pickImg('Shillong cafe, music, and Ward Lake evening')],
  ['91000000-0000-4000-8000-000000000012', 6, 'Laitlum Canyon sunrise drive', 'nature', 3400, 4, 'Early shared cab, canyon viewpoint, packed breakfast, and fog-aware timing.', pickImg('Laitlum Canyon sunrise drive')],
  ['91000000-0000-4000-8000-000000000013', 7, 'Nohkalikai and Seven Sisters waterfall circuit', 'sightseeing', 4100, 5, 'Waterfall circuit with viewpoint timing, rain poncho stop, and local lunch.', pickImg('Nohkalikai and Seven Sisters waterfall circuit')],
  ['91000000-0000-4000-8000-000000000014', 7, 'Double-decker living root bridge trek', 'adventure', 5200, 7, 'Nongriat trek with guide, packed lunch, waterfall swim window, and knee-care pacing.', pickImg('Double-decker living root bridge trek')],
  ['91000000-0000-4000-8000-000000000015', 8, 'Dawki clear-water boating', 'adventure', 2600, 2, 'Umngot boat ride, border viewpoint, and dry-bag photography tips.', pickImg('Dawki clear-water boating')],
  ['91000000-0000-4000-8000-000000000016', 8, 'Mawlynnong village and bamboo skywalk', 'cultural', 3000, 3.5, 'Clean village walk, bamboo skywalk, local lunch, and handmade souvenir stop.', pickImg('Mawlynnong village and bamboo skywalk')]
] as const;

const kashmirSlug = 'kashmir-luxury-from-vijayawada-demo';
const hampiSlug = 'hampi-gokarna-budget-from-vijayawada-demo';
const meghalayaSlug = 'meghalaya-friends-adventure-from-vijayawada-demo';
const legacySlugs = ['japan-cherry-blossom-luxury-demo', 'bali-budget-backpacking-demo', 'europe-friends-adventure-demo'];
const tripSlugs = [kashmirSlug, hampiSlug, meghalayaSlug];

function at(hour: number, minute = 0): Date {
  return new Date(Date.UTC(1970, 0, 1, hour, minute, 0));
}

function cityId(index: number): string {
  const city = cities[index];
  if (!city) throw new Error(`Missing showcase city index ${index}`);
  return city[0];
}

function activityByIndex(index: number): (typeof activities)[number] {
  const activity = activities[index];
  if (!activity) throw new Error(`Missing showcase activity index ${index}`);
  return activity;
}

function stopIdByIndex(stopIds: string[], index: number): string {
  const stopId = stopIds[index];
  if (!stopId) throw new Error(`Missing showcase stop index ${index}`);
  return stopId;
}

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const existingUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  const usernameOwner = await prisma.user.findUnique({ where: { username: 'koushik.travels' } });
  const username = !usernameOwner || usernameOwner.email === DEMO_EMAIL ? 'koushik.travels' : existingUser?.username ?? 'koushikt33_showcase';

  const profile = {
    name: 'Koushik Talukder',
    username,
    phoneNumber: '+919876543210',
    avatarUrl: 'https://i.pravatar.cc/512?img=12',
    bio: 'Vijayawada-based AI travel planner who builds realistic India-first itineraries around train/flight connections, beautiful stays, local food, and rupee-perfect budgets.',
    travelerProfile: 'solo',
    preferredBudgetMin: 25000,
    preferredBudgetMax: 250000,
    travelStyles: ['luxury', 'backpacking', 'food', 'adventure', 'culture', 'photography'],
    travelPreferences: {
      currency: 'INR',
      locale: 'en-IN',
      homeBase: 'Vijayawada, Andhra Pradesh',
      favoriteDestinations: ['Kashmir', 'Hampi', 'Gokarna', 'Meghalaya', 'Araku Valley'],
      stats: { statesExplored: 18, cities: 46, publicTrips: 2, savedPlaces: 74 },
      recentActivity: [
        'Published Kashmir Luxury Escape from Vijayawada',
        'Uploaded Hampi train and hostel confirmations',
        'Completed Meghalaya group adventure checklist'
      ]
    }
  };

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: profile,
    create: {
      email: DEMO_EMAIL,
      passwordHash,
      ...profile
    }
  });

  for (const city of cities) {
    await prisma.city.upsert({
      where: { id: city[0] },
      update: {
        name: city[1], state: city[2], country: city[3], countryCode: city[4],
        latitude: city[5], longitude: city[6], costIndex: city[7], areaType: city[8],
        bestSeason: city[9], isRegionalGem: city[10], region: city[11], thumbnailUrl: city[12]
      },
      create: {
        id: city[0], name: city[1], state: city[2], country: city[3], countryCode: city[4],
        latitude: city[5], longitude: city[6], costIndex: city[7], areaType: city[8],
        bestSeason: city[9], isRegionalGem: city[10], region: city[11], thumbnailUrl: city[12]
      }
    });
  }

  for (const activity of activities) {
    const targetCityId = cityId(activity[1]);
    await prisma.activity.upsert({
      where: { id: activity[0] },
      update: {
        cityId: targetCityId,
        name: activity[2],
        category: activity[3],
        tripTypeTags: ['solo', 'couple', 'group', 'budget', 'luxury'],
        estimatedCostUsd: activity[4],
        durationHours: activity[5],
        description: activity[6],
        imageUrl: activity[7]
      },
      create: {
        id: activity[0],
        cityId: targetCityId,
        name: activity[2],
        category: activity[3],
        tripTypeTags: ['solo', 'couple', 'group', 'budget', 'luxury'],
        estimatedCostUsd: activity[4],
        durationHours: activity[5],
        description: activity[6],
        imageUrl: activity[7]
      }
    });
  }

  await prisma.trip.deleteMany({
    where: {
      userId: user.id,
      OR: [
        { publicSlug: { in: [...legacySlugs, ...tripSlugs] } },
        {
          title: {
            in: [
              'Kashmir Luxury Escape from Vijayawada',
              'Hampi + Gokarna Budget Backpacking',
              'Meghalaya Friends Adventure'
            ]
          }
        }
      ]
    }
  });

  await createTrip(user.id, {
    slug: kashmirSlug,
    title: 'Kashmir Luxury Escape from Vijayawada',
    description: 'A premium 7-day Kashmir plan priced in INR from Vijayawada: Vijayawada-Hyderabad-Srinagar flight routing, boutique stays, private cabs, shikara evening, Gulmarg gondola, and Pahalgam valley circuit.',
    cover: cityCover('Srinagar'),
    start: '2026-03-18',
    end: '2026-03-24',
    type: 'couple',
    vibe: 'luxury',
    cap: 385000,
    status: 'planning',
    isPublic: true,
    stops: [
      { city: 1, order: 0, arrive: '2026-03-18', depart: '2026-03-20', hotel: 'The LaLit Grand Palace Srinagar - Palace Room', hotelCost: 72000, notes: 'From Vijayawada: evening train/cab to HYD, morning HYD-SXR flight. Weather 4-14C; carry thermals and ID copies for airport checks.' },
      { city: 2, order: 1, arrive: '2026-03-21', depart: '2026-03-22', hotel: 'Khyber Himalayan Resort - Premier Room', hotelCost: 68000, notes: 'Private cab from Srinagar. AI tip: book gondola Phase 1 online and leave Phase 2 flexible for weather.' },
      { city: 3, order: 2, arrive: '2026-03-23', depart: '2026-03-24', hotel: 'Welcomhotel Pine N Peak Pahalgam', hotelCost: 52000, notes: 'Keep a driver buffer for valley roads. Return to Srinagar airport next morning with 4-hour margin.' }
    ],
    stopActivities: [[0, [0, 1]], [1, [2, 3]], [2, [4, 5]]],
    packing: [
      ['Documents', ['Aadhaar + passport backup', 'HYD-SXR flight tickets', 'Hotel confirmations', 'Travel insurance PDF'], 4],
      ['Winter Wardrobe', ['Thermal innerwear', 'Water-resistant jacket', 'Wool socks', 'Gloves and beanie'], 2],
      ['Tech', ['Power bank', 'Camera batteries', 'Offline maps', 'UPI + backup forex card'], 3]
    ],
    notes: [
      ['AI Route Strategy', 'Start from Vijayawada via Hyderabad to reduce airfare volatility. Keep Gulmarg before Pahalgam so weather delays do not break the return flight.', 'ai', true],
      ['Premium Food Shortlist', 'Srinagar: Ahdoos wazwan lunch. Gulmarg: Khyber dinner. Pahalgam: trout dinner by Lidder with early reservation.', 'food', false],
      ['Share Preview', 'Public showcase link copied for judges. Highlight: INR budget, Vijayawada routing, luxury Kashmir planning, and rich trip vault.', 'share', false]
    ],
    media: [
      ['photo', pickImg('dal lake shikara luxury'), 'Dal Lake shikara and palace stay moodboard', null],
      ['photo', pickImg('gulmarg snow gondola india'), 'Gulmarg gondola and snow meadow route', null],
      ['document', docUrl, 'HYD-SXR return flight PNR and cab pickup notes', 'kashmir_flight_cab_bundle_vijayawada.pdf'],
      ['document', docUrl, 'Hotel confirmations and insurance packet', 'kashmir_hotels_insurance_bundle.pdf']
    ]
  });

  await createTrip(user.id, {
    slug: hampiSlug,
    title: 'Hampi + Gokarna Budget Backpacking',
    description: 'A practical 6-day backpacking route from Vijayawada using train-first routing, hostels, buses, ruins, beaches, low-cost food, and AI guardrails to keep the trip under a realistic rupee budget.',
    cover: pickImg('hampi gokarna backpacking'),
    start: '2026-08-09',
    end: '2026-08-14',
    type: 'solo',
    vibe: 'backpacker',
    cap: 42000,
    status: 'planning',
    isPublic: true,
    stops: [
      { city: 4, order: 0, arrive: '2026-08-09', depart: '2026-08-11', hotel: 'Hampi Boulders Backpacker Hostel', hotelCost: 3600, notes: 'Vijayawada-Hospet train target fare 1800-2600. Rent cycle locally; keep afternoons slow due heat.' },
      { city: 5, order: 1, arrive: '2026-08-12', depart: '2026-08-14', hotel: 'Zostel Gokarna - Dorm Bed', hotelCost: 4200, notes: 'Hospet-Gokarna overnight bus. Keep one beach hike day and one flexible cafe/work block.' }
    ],
    stopActivities: [[0, [6, 7]], [1, [8, 9]]],
    packing: [
      ['Documents', ['Aadhaar', 'Train tickets', 'Hostel confirmations', 'Insurance screenshot'], 3],
      ['Backpacking', ['40L backpack', 'Quick-dry towel', 'Reusable bottle', 'Laundry pouch'], 2],
      ['Beach + Heat', ['Sunscreen', 'Cap', 'Sandals', 'Electrolytes', 'Offline maps'], 3]
    ],
    notes: [
      ['Budget Guardrails', 'Target 6500-7500 per day including stay, food, rentals, and local transport. Keep train/bus bookings locked 3 weeks earlier from Vijayawada.', 'budget', true],
      ['Hidden Gems', 'Hampi: Sanapur lake sunset and local thali near bazaar. Gokarna: Half Moon trail before 8 AM and Kudle sunset after cafe work block.', 'ai', false],
      ['Upload Checklist', 'Add train PDF, bus ticket screenshot, hostel confirmation, and insurance card before leaving Vijayawada.', 'document', false]
    ],
    media: [
      ['photo', cityCover('Hampi'), 'Hampi ruins sunrise and boulder viewpoint', null],
      ['photo', cityCover('Gokarna'), 'Gokarna beach sunset and hostel route', null],
      ['document', docUrl, 'Vijayawada-Hospet train and Hospet-Gokarna bus tickets', 'hampi_gokarna_transport_tickets.pdf'],
      ['document', docUrl, 'Hostel confirmations and emergency contacts', 'hampi_gokarna_hostel_emergency_pack.pdf']
    ]
  });

  await createTrip(user.id, {
    slug: meghalayaSlug,
    title: 'Meghalaya Friends Adventure',
    description: 'A 7-day group adventure from Vijayawada via Hyderabad and Guwahati, built for waterfalls, root bridges, Dawki river boating, shared cabs, monsoon-aware packing, and split-wise INR budgeting.',
    cover: cityCover('Cherrapunji'),
    start: '2026-10-03',
    end: '2026-10-09',
    type: 'group',
    vibe: 'comfort',
    cap: 188000,
    status: 'planning',
    isPublic: false,
    stops: [
      { city: 6, order: 0, arrive: '2026-10-03', depart: '2026-10-04', hotel: 'The Habitat Shillong - Family Suite', hotelCost: 24000, notes: 'Vijayawada-HYD-Guwahati flight, shared cab to Shillong. Keep jackets accessible after landing.' },
      { city: 7, order: 1, arrive: '2026-10-05', depart: '2026-10-07', hotel: 'Saimika Resort Cherrapunji - Cottage', hotelCost: 36000, notes: 'Use local driver for waterfall circuit. AI pacing: root bridge trek gets its own day, not after heavy travel.' },
      { city: 8, order: 2, arrive: '2026-10-08', depart: '2026-10-09', hotel: 'Betelnut Resort Dawki - Riverside Rooms', hotelCost: 18000, notes: 'Boat early before crowds. Return to Guwahati with buffer for evening flight.' }
    ],
    stopActivities: [[0, [10, 11]], [1, [12, 13]], [2, [14, 15]]],
    packing: [
      ['Documents', ['Aadhaar', 'Flight tickets', 'Hotel confirmations', 'Insurance PDF'], 4],
      ['Rain + Trek', ['Poncho', 'Trekking shoes', 'Dry bag', 'Knee support', 'Torch'], 3],
      ['Group Gear', ['First-aid pouch', 'Bluetooth tracker tags', 'Shared power bank', 'Card game'], 2]
    ],
    notes: [
      ['Group Rules', 'One friend owns flights, one owns hotels, one tracks shared cab and activity expenses. All costs entered in INR and split four ways.', 'collaboration', true],
      ['AI Transport Plan', 'Fly Vijayawada-Hyderabad-Guwahati, then shared SUV for Meghalaya. Avoid late-night hill driving and keep Dawki as the final light day.', 'ai', false],
      ['Budget Split', 'Expected group spend: flights 72000, stays 78000, cabs 26000, food and activities 12000. Personal buffer: 12000 each.', 'budget', false]
    ],
    media: [
      ['photo', cityCover('Shillong'), 'Shillong and Laitlum group day moodboard', null],
      ['photo', cityCover('Cherrapunji'), 'Living root bridge trek checklist image', null],
      ['photo', cityCover('Dawki'), 'Dawki clear-water boating plan', null],
      ['document', docUrl, 'Flight tickets and shared cab invoice', 'meghalaya_group_transport_confirmations.pdf'],
      ['document', docUrl, 'Hotel confirmations and insurance packet', 'meghalaya_group_hotels_insurance.pdf']
    ]
  });

  const storytellers = await Promise.all([
    upsertCommunityUser('ananya.trails@traveloop.demo', 'Ananya Rao', 'ananya.trails', 'https://i.pravatar.cc/512?img=22', 'Food-first slow traveler and weekend storyteller.'),
    upsertCommunityUser('rahul.hikes@traveloop.demo', 'Rahul Mehta', 'rahul.hikes', 'https://i.pravatar.cc/512?img=38', 'Mountain chaser and practical backpacking planner.'),
    upsertCommunityUser('meera.nomad@traveloop.demo', 'Meera Nair', 'meera.nomad', 'https://i.pravatar.cc/512?img=48', 'Remote-work traveler exploring premium stays in India.')
  ]);

  await prisma.communityComment.deleteMany();
  await prisma.communityLike.deleteMany();
  await prisma.communityBookmark.deleteMany();
  await prisma.communityPost.deleteMany();

  const publicTrips = await prisma.trip.findMany({
    where: { userId: user.id, isPublic: true },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const samplePosts = [
    {
      authorId: storytellers[0]?.id ?? user.id,
      tripId: publicTrips[0]?.id ?? null,
      title: 'How we planned Kashmir luxury under INR 3.9L from Vijayawada',
      content:
        'Built this itinerary around reliable HYD flight connections, weather-safe buffers, and private transfers. Biggest win: pre-booking gondola and keeping one flexible mountain day.',
      destinationName: 'Kashmir',
      heroImageUrl: cityCover('Srinagar'),
      budgetInr: 385000
    },
    {
      authorId: storytellers[1]?.id ?? user.id,
      tripId: publicTrips[1]?.id ?? null,
      title: 'Hampi + Gokarna backpacking route that actually works',
      content:
        'Train-first strategy from Vijayawada kept costs controlled, while sunset beach windows and low-effort transfers avoided burnout. Shared all stay + transport docs inside the trip.',
      destinationName: 'Hampi, Gokarna',
      heroImageUrl: pickImg('hampi gokarna beach'),
      budgetInr: 42000
    },
    {
      authorId: storytellers[2]?.id ?? user.id,
      tripId: null,
      title: 'Meghalaya monsoon playbook for groups',
      content:
        'Use a single spreadsheet owner for cabs, start treks early, and carry dry-bag essentials for camera + docs. Dawki water clarity is best before midday rush.',
      destinationName: 'Meghalaya',
      heroImageUrl: pickImg('meghalaya waterfalls dawki'),
      budgetInr: 188000
    }
  ] as const;

  for (const post of samplePosts) {
    const createdPost = await prisma.communityPost.create({
      data: {
        userId: post.authorId,
        tripId: post.tripId,
        title: post.title,
        content: post.content,
        destinationName: post.destinationName,
        heroImageUrl: post.heroImageUrl,
        budgetInr: post.budgetInr
      }
    });
    await prisma.communityLike.createMany({
      data: storytellers
        .filter((u) => u.id !== post.authorId)
        .slice(0, 2)
        .map((u) => ({ postId: createdPost.id, userId: u.id })),
      skipDuplicates: true
    });
    await prisma.communityComment.createMany({
      data: storytellers
        .filter((u) => u.id !== post.authorId)
        .slice(0, 2)
        .map((u, idx) => ({
          postId: createdPost.id,
          userId: u.id,
          body:
            idx === 0
              ? 'This route breakdown is super practical. Saving it for my next long weekend.'
              : 'Love the INR budgeting detail and realistic transit buffers.'
        }))
    });
    await prisma.communityBookmark.create({
      data: {
        postId: createdPost.id,
        userId: user.id
      }
    });
  }

  console.log(`INR showcase data seeded for ${DEMO_EMAIL}. Demo password for newly created users: ${DEMO_PASSWORD}`);
}

async function upsertCommunityUser(email: string, name: string, username: string, avatarUrl: string, bio: string) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, username, avatarUrl, bio, travelerProfile: 'solo', travelPreferences: { currency: 'INR', locale: 'en-IN' } },
    create: {
      email,
      passwordHash,
      name,
      username,
      avatarUrl,
      bio,
      travelerProfile: 'solo',
      travelPreferences: { currency: 'INR', locale: 'en-IN' }
    }
  });
}

async function createTrip(userId: string, trip: {
  slug: string;
  title: string;
  description: string;
  cover: string;
  start: string;
  end: string;
  type: string;
  vibe: string;
  cap: number;
  status: string;
  isPublic: boolean;
  stops: Array<{ city: number; order: number; arrive: string; depart: string; hotel: string; hotelCost: number; notes: string }>;
  stopActivities: Array<[number, number[]]>;
  packing: Array<[string, string[], number]>;
  notes: Array<[string, string, string, boolean]>;
  media: Array<[string, string, string, string | null]>;
}): Promise<void> {
  const createdTrip = await prisma.trip.create({
    data: {
      userId,
      title: trip.title,
      description: trip.description,
      coverPhotoUrl: trip.cover,
      startDate: new Date(trip.start),
      endDate: new Date(trip.end),
      tripType: trip.type,
      budgetCapUsd: Math.round((trip.cap / INR_PER_USD_SEED) * 100) / 100,
      vibe: trip.vibe,
      status: trip.status,
      isPublic: trip.isPublic,
      publicSlug: trip.slug
    }
  });

  const stopIds: string[] = [];
  for (const stop of trip.stops) {
    const createdStop = await prisma.stop.create({
      data: {
        tripId: createdTrip.id,
        cityId: cityId(stop.city),
        orderIndex: stop.order,
        arrivalDate: new Date(stop.arrive),
        departureDate: new Date(stop.depart),
        accommodationName: stop.hotel,
        accommodationCost: stop.hotelCost,
        notes: stop.notes
      }
    });
    stopIds.push(createdStop.id);
  }

  const times = [at(8, 30), at(16, 0), at(19, 30)];
  for (const [stopIndex, activityIndexes] of trip.stopActivities) {
    for (const [index, activityIndex] of activityIndexes.entries()) {
      const activity = activityByIndex(activityIndex);
      await prisma.stopActivity.create({
        data: {
          stopId: stopIdByIndex(stopIds, stopIndex),
          activityId: activity[0],
          scheduledTime: times[index] ?? at(12),
          actualCostUsd: activity[4],
          isCompleted: stopIndex === 0
        }
      });
    }
  }

  for (const [category, items, packedCount] of trip.packing) {
    for (const [index, name] of items.entries()) {
      await prisma.packingItem.create({
        data: {
          tripId: createdTrip.id,
          category,
          name,
          isPacked: index < packedCount,
          aiSuggested: index > 1
        }
      });
    }
  }

  for (const [index, note] of trip.notes.entries()) {
    const data: Prisma.TripNoteUncheckedCreateInput = {
      tripId: createdTrip.id,
      title: note[0],
      content: note[1],
      noteType: note[2],
      isImportant: note[3]
    };
    const noteStopId = stopIds[index];
    if (noteStopId) data.stopId = noteStopId;

    await prisma.tripNote.create({ data });
  }

  for (const [index, media] of trip.media.entries()) {
    const isDocument = media[0] === 'document';
    const data: Prisma.MediaUploadUncheckedCreateInput = {
      tripId: createdTrip.id,
      userId,
      mediaType: media[0],
      cloudinaryUrl: media[1],
      cloudinaryId: `traveloop/showcase/${trip.slug}/${index + 1}`,
      caption: media[2]
    };

    if (!isDocument && stopIds.length > 0) data.stopId = stopIds[index % stopIds.length] ?? null;
    if (isDocument) {
      data.documentType = media[3]?.includes('insurance') ? 'insurance' : media[3]?.includes('hotel') ? 'hotel' : 'ticket';
      data.fileName = media[3] ?? null;
      data.fileSizeBytes = 384000 + index * 42000;
      data.mimeType = 'application/pdf';
      data.expiresAt = new Date(trip.end);
    }

    await prisma.mediaUpload.create({ data });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
