import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cities = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Delhi',
    state: 'Delhi',
    country: 'India',
    countryCode: 'IN',
    latitude: 28.6139,
    longitude: 77.209,
    costIndex: 'medium',
    areaType: 'city',
    bestSeason: 'Oct-Mar',
    isRegionalGem: false,
    region: 'North India'
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    latitude: 26.9124,
    longitude: 75.7873,
    costIndex: 'medium',
    areaType: 'city',
    bestSeason: 'Oct-Feb',
    isRegionalGem: false,
    region: 'North India'
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    latitude: 24.5854,
    longitude: 73.7125,
    costIndex: 'medium',
    areaType: 'city',
    bestSeason: 'Sep-Mar',
    isRegionalGem: true,
    region: 'North India'
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Kochi',
    state: 'Kerala',
    country: 'India',
    countryCode: 'IN',
    latitude: 9.9312,
    longitude: 76.2673,
    costIndex: 'medium',
    areaType: 'city',
    bestSeason: 'Oct-Feb',
    isRegionalGem: false,
    region: 'South India'
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Hampi',
    state: 'Karnataka',
    country: 'India',
    countryCode: 'IN',
    latitude: 15.335,
    longitude: 76.46,
    costIndex: 'low',
    areaType: 'town',
    bestSeason: 'Nov-Feb',
    isRegionalGem: true,
    region: 'South India'
  }
];

cities.push(
  { id: '00000000-0000-4000-8000-000000000006', name: 'Mumbai', state: 'Maharashtra', country: 'India', countryCode: 'IN', latitude: 19.076, longitude: 72.8777, costIndex: 'high', areaType: 'city', bestSeason: 'Nov-Feb', isRegionalGem: false, region: 'West India' },
  { id: '00000000-0000-4000-8000-000000000007', name: 'Pune', state: 'Maharashtra', country: 'India', countryCode: 'IN', latitude: 18.5204, longitude: 73.8567, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'West India' },
  { id: '00000000-0000-4000-8000-000000000008', name: 'Goa', state: 'Goa', country: 'India', countryCode: 'IN', latitude: 15.2993, longitude: 74.124, costIndex: 'medium', areaType: 'coastal', bestSeason: 'Nov-Feb', isRegionalGem: false, region: 'West India' },
  { id: '00000000-0000-4000-8000-000000000009', name: 'Ahmedabad', state: 'Gujarat', country: 'India', countryCode: 'IN', latitude: 23.0225, longitude: 72.5714, costIndex: 'medium', areaType: 'city', bestSeason: 'Nov-Feb', isRegionalGem: false, region: 'West India' },
  { id: '00000000-0000-4000-8000-000000000010', name: 'Rann of Kutch', state: 'Gujarat', country: 'India', countryCode: 'IN', latitude: 23.7337, longitude: 69.8597, costIndex: 'medium', areaType: 'desert', bestSeason: 'Nov-Feb', isRegionalGem: true, region: 'West India' },
  { id: '00000000-0000-4000-8000-000000000011', name: 'Jodhpur', state: 'Rajasthan', country: 'India', countryCode: 'IN', latitude: 26.2389, longitude: 73.0243, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000012', name: 'Jaisalmer', state: 'Rajasthan', country: 'India', countryCode: 'IN', latitude: 26.9157, longitude: 70.9083, costIndex: 'medium', areaType: 'desert', bestSeason: 'Nov-Feb', isRegionalGem: true, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000013', name: 'Pushkar', state: 'Rajasthan', country: 'India', countryCode: 'IN', latitude: 26.489, longitude: 74.5511, costIndex: 'low', areaType: 'town', bestSeason: 'Oct-Mar', isRegionalGem: true, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000014', name: 'Agra', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', latitude: 27.1767, longitude: 78.0081, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Mar', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000015', name: 'Varanasi', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', latitude: 25.3176, longitude: 82.9739, costIndex: 'low', areaType: 'city', bestSeason: 'Oct-Mar', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000016', name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', countryCode: 'IN', latitude: 26.8467, longitude: 80.9462, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000017', name: 'Amritsar', state: 'Punjab', country: 'India', countryCode: 'IN', latitude: 31.634, longitude: 74.8723, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Mar', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000018', name: 'Chandigarh', state: 'Chandigarh', country: 'India', countryCode: 'IN', latitude: 30.7333, longitude: 76.7794, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Mar', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000019', name: 'Shimla', state: 'Himachal Pradesh', country: 'India', countryCode: 'IN', latitude: 31.1048, longitude: 77.1734, costIndex: 'medium', areaType: 'hill', bestSeason: 'Mar-Jun', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000020', name: 'Manali', state: 'Himachal Pradesh', country: 'India', countryCode: 'IN', latitude: 32.2432, longitude: 77.1892, costIndex: 'medium', areaType: 'hill', bestSeason: 'Mar-Jun', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000021', name: 'Dharamshala', state: 'Himachal Pradesh', country: 'India', countryCode: 'IN', latitude: 32.219, longitude: 76.3234, costIndex: 'low', areaType: 'hill', bestSeason: 'Mar-Jun', isRegionalGem: true, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000022', name: 'Rishikesh', state: 'Uttarakhand', country: 'India', countryCode: 'IN', latitude: 30.0869, longitude: 78.2676, costIndex: 'low', areaType: 'river', bestSeason: 'Sep-Apr', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000023', name: 'Dehradun', state: 'Uttarakhand', country: 'India', countryCode: 'IN', latitude: 30.3165, longitude: 78.0322, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Mar', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000024', name: 'Nainital', state: 'Uttarakhand', country: 'India', countryCode: 'IN', latitude: 29.3919, longitude: 79.4542, costIndex: 'medium', areaType: 'hill', bestSeason: 'Mar-Jun', isRegionalGem: false, region: 'North India' },
  { id: '00000000-0000-4000-8000-000000000025', name: 'Kolkata', state: 'West Bengal', country: 'India', countryCode: 'IN', latitude: 22.5726, longitude: 88.3639, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'East India' },
  { id: '00000000-0000-4000-8000-000000000026', name: 'Darjeeling', state: 'West Bengal', country: 'India', countryCode: 'IN', latitude: 27.041, longitude: 88.2663, costIndex: 'medium', areaType: 'hill', bestSeason: 'Mar-May', isRegionalGem: false, region: 'East India' },
  { id: '00000000-0000-4000-8000-000000000027', name: 'Sundarbans', state: 'West Bengal', country: 'India', countryCode: 'IN', latitude: 21.9497, longitude: 89.1833, costIndex: 'medium', areaType: 'forest', bestSeason: 'Nov-Feb', isRegionalGem: true, region: 'East India' },
  { id: '00000000-0000-4000-8000-000000000028', name: 'Bhubaneswar', state: 'Odisha', country: 'India', countryCode: 'IN', latitude: 20.2961, longitude: 85.8245, costIndex: 'low', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'East India' },
  { id: '00000000-0000-4000-8000-000000000029', name: 'Puri', state: 'Odisha', country: 'India', countryCode: 'IN', latitude: 19.8135, longitude: 85.8312, costIndex: 'low', areaType: 'coastal', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'East India' },
  { id: '00000000-0000-4000-8000-000000000030', name: 'Guwahati', state: 'Assam', country: 'India', countryCode: 'IN', latitude: 26.1445, longitude: 91.7362, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Apr', isRegionalGem: false, region: 'North East India' },
  { id: '00000000-0000-4000-8000-000000000031', name: 'Shillong', state: 'Meghalaya', country: 'India', countryCode: 'IN', latitude: 25.5788, longitude: 91.8933, costIndex: 'medium', areaType: 'hill', bestSeason: 'Oct-May', isRegionalGem: false, region: 'North East India' },
  { id: '00000000-0000-4000-8000-000000000032', name: 'Cherrapunji', state: 'Meghalaya', country: 'India', countryCode: 'IN', latitude: 25.2702, longitude: 91.7323, costIndex: 'medium', areaType: 'hill', bestSeason: 'Oct-May', isRegionalGem: true, region: 'North East India' },
  { id: '00000000-0000-4000-8000-000000000033', name: 'Gangtok', state: 'Sikkim', country: 'India', countryCode: 'IN', latitude: 27.3314, longitude: 88.6138, costIndex: 'medium', areaType: 'hill', bestSeason: 'Mar-May', isRegionalGem: false, region: 'North East India' },
  { id: '00000000-0000-4000-8000-000000000034', name: 'Bengaluru', state: 'Karnataka', country: 'India', countryCode: 'IN', latitude: 12.9716, longitude: 77.5946, costIndex: 'high', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000035', name: 'Mysuru', state: 'Karnataka', country: 'India', countryCode: 'IN', latitude: 12.2958, longitude: 76.6394, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000036', name: 'Gokarna', state: 'Karnataka', country: 'India', countryCode: 'IN', latitude: 14.5479, longitude: 74.3188, costIndex: 'low', areaType: 'coastal', bestSeason: 'Oct-Mar', isRegionalGem: true, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000037', name: 'Chennai', state: 'Tamil Nadu', country: 'India', countryCode: 'IN', latitude: 13.0827, longitude: 80.2707, costIndex: 'medium', areaType: 'city', bestSeason: 'Nov-Feb', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000038', name: 'Madurai', state: 'Tamil Nadu', country: 'India', countryCode: 'IN', latitude: 9.9252, longitude: 78.1198, costIndex: 'low', areaType: 'city', bestSeason: 'Oct-Mar', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000039', name: 'Ooty', state: 'Tamil Nadu', country: 'India', countryCode: 'IN', latitude: 11.4102, longitude: 76.695, costIndex: 'medium', areaType: 'hill', bestSeason: 'Apr-Jun', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000040', name: 'Pondicherry', state: 'Puducherry', country: 'India', countryCode: 'IN', latitude: 11.9416, longitude: 79.8083, costIndex: 'medium', areaType: 'coastal', bestSeason: 'Oct-Mar', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000041', name: 'Hyderabad', state: 'Telangana', country: 'India', countryCode: 'IN', latitude: 17.385, longitude: 78.4867, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000042', name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', countryCode: 'IN', latitude: 17.6868, longitude: 83.2185, costIndex: 'low', areaType: 'coastal', bestSeason: 'Oct-Mar', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000043', name: 'Munnar', state: 'Kerala', country: 'India', countryCode: 'IN', latitude: 10.0889, longitude: 77.0595, costIndex: 'medium', areaType: 'hill', bestSeason: 'Sep-Mar', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000044', name: 'Alleppey', state: 'Kerala', country: 'India', countryCode: 'IN', latitude: 9.4981, longitude: 76.3388, costIndex: 'medium', areaType: 'backwater', bestSeason: 'Nov-Feb', isRegionalGem: false, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000045', name: 'Varkala', state: 'Kerala', country: 'India', countryCode: 'IN', latitude: 8.7379, longitude: 76.7163, costIndex: 'medium', areaType: 'coastal', bestSeason: 'Nov-Feb', isRegionalGem: true, region: 'South India' },
  { id: '00000000-0000-4000-8000-000000000046', name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', countryCode: 'IN', latitude: 23.2599, longitude: 77.4126, costIndex: 'low', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'Central India' },
  { id: '00000000-0000-4000-8000-000000000047', name: 'Khajuraho', state: 'Madhya Pradesh', country: 'India', countryCode: 'IN', latitude: 24.8318, longitude: 79.9199, costIndex: 'low', areaType: 'town', bestSeason: 'Oct-Mar', isRegionalGem: true, region: 'Central India' },
  { id: '00000000-0000-4000-8000-000000000048', name: 'Indore', state: 'Madhya Pradesh', country: 'India', countryCode: 'IN', latitude: 22.7196, longitude: 75.8577, costIndex: 'medium', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'Central India' },
  { id: '00000000-0000-4000-8000-000000000049', name: 'Raipur', state: 'Chhattisgarh', country: 'India', countryCode: 'IN', latitude: 21.2514, longitude: 81.6296, costIndex: 'low', areaType: 'city', bestSeason: 'Oct-Feb', isRegionalGem: false, region: 'Central India' },
  { id: '00000000-0000-4000-8000-000000000050', name: 'Leh', state: 'Ladakh', country: 'India', countryCode: 'IN', latitude: 34.1526, longitude: 77.5771, costIndex: 'high', areaType: 'mountain', bestSeason: 'Jun-Sep', isRegionalGem: false, region: 'North India' }
);

const activityTemplates = [
  { name: 'Heritage walk', category: 'cultural', estimatedCostUsd: 18, durationHours: 2.5 },
  { name: 'Local food trail', category: 'food', estimatedCostUsd: 22, durationHours: 3 },
  { name: 'Museum visit', category: 'sightseeing', estimatedCostUsd: 10, durationHours: 2 },
  { name: 'Sunset viewpoint', category: 'sightseeing', estimatedCostUsd: 0, durationHours: 1.5 }
];

const main = async (): Promise<void> => {
  for (const city of cities) {
    const createdCity = await prisma.city.upsert({
      where: { id: city.id },
      update: city,
      create: city
    });

    const activityNames = activityTemplates.map((activity) => `${activity.name} in ${createdCity.name}`);
    await prisma.activity.deleteMany({
      where: {
        cityId: createdCity.id,
        name: { in: activityNames }
      }
    });

    for (const activity of activityTemplates) {
      await prisma.activity.create({
        data: {
          cityId: createdCity.id,
          name: `${activity.name} in ${createdCity.name}`,
          category: activity.category,
          tripTypeTags: ['solo', 'couple', 'family'],
          estimatedCostUsd: activity.estimatedCostUsd,
          durationHours: activity.durationHours,
          description: `Curated ${activity.category} experience for ${createdCity.name}.`
        }
      });
    }
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
