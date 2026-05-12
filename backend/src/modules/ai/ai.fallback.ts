import type { BudgetEstimate, GeneratedItinerary, PackingList } from '../../../shared/types';
import type { BudgetEstimateDto, ItineraryDto, PackingSuggestionDto } from './ai.dto';

export const fallbackItinerary = (dto: ItineraryDto): GeneratedItinerary => ({
  summary: `A practical ${dto.days}-day ${dto.vibe} plan built from Traveloop fallback intelligence.`,
  routeStrategy: dto.preferences?.source && dto.preferences?.destination
    ? `Start from ${dto.preferences.source}, keep transfers early, and base the route around ${dto.preferences.destination}.`
    : 'Use one primary base, start sightseeing early, and keep evenings flexible for food and local walks.',
  totalEstimatedCostInr: Math.round((dto.vibe === 'luxury' ? 12000 : dto.vibe === 'comfort' ? 6500 : 3200) * dto.days),
  transportationOptions: [
    {
      mode: dto.preferences?.transportationPreferences?.[0] ?? 'train/flight',
      route: [dto.preferences?.source, dto.preferences?.destination ?? dto.prompt].filter(Boolean).join(' to '),
      estimatedDuration: 'Check live schedules before booking',
      estimatedCostInr: dto.vibe === 'luxury' ? 9000 : dto.vibe === 'comfort' ? 3500 : 1200,
      bookingTip: 'Compare one early-morning option and one evening option before locking hotels.'
    }
  ],
  staySuggestions: [
    {
      area: dto.preferences?.destination ?? 'central neighborhood',
      type: dto.preferences?.stayPreference ?? `${dto.vibe} hotel`,
      nightlyBudgetInr: dto.vibe === 'luxury' ? 12000 : dto.vibe === 'comfort' ? 4500 : 1200,
      why: 'Keeps commute times lower and makes food/market access easier.'
    }
  ],
  hiddenGems: dto.preferences?.placesToCover?.slice(0, 3) ?? ['Old market walk', 'Sunrise viewpoint', 'Neighborhood food stop'],
  nearbyPlaces: ['Local market', 'Heritage quarter', 'Evening viewpoint'],
  timingTips: [
    'Start outdoor sightseeing before 9 AM and move indoor or cafe plans to the afternoon.',
    'Keep 60-90 minutes of buffer around intercity transfers.'
  ],
  stops: [
    {
      city: dto.preferences?.destination ?? 'Delhi',
      country: 'India',
      days: Math.max(1, Math.min(dto.days, 2)),
      estimatedCostUsd: dto.vibe === 'luxury' ? 18000 : dto.vibe === 'comfort' ? 9500 : 3800,
      estimatedCostInr: dto.vibe === 'luxury' ? 18000 : dto.vibe === 'comfort' ? 9500 : 3800,
      dailyBreakdown: Array.from({ length: Math.max(1, Math.min(dto.days, 2)) }, (_, index) => ({
        day: index + 1,
        date: null,
        baseCity: dto.preferences?.destination ?? 'Delhi',
        morning: 'Arrive, check in, and cover the closest landmark cluster.',
        afternoon: 'Slow lunch followed by one museum, temple, market, or nature stop.',
        evening: 'Food walk and relaxed local neighborhood time.',
        transport: 'Use metro/cab locally; keep airport or station transfer pre-booked.',
        meals: [dto.preferences?.foodPreference ?? 'local cuisine', 'high-rated casual dinner'],
        estimatedCostInr: dto.vibe === 'luxury' ? 7000 : dto.vibe === 'comfort' ? 3800 : 1600,
        travelTime: '1-2 hours local movement'
      })),
      activities: [
        { name: 'Heritage walk', category: 'cultural', costUsd: 1500, durationHours: 2.5 },
        { name: 'Local food trail', category: 'food', costUsd: 1800, durationHours: 3 }
      ],
      transportation: [
        {
          mode: 'local cab',
          route: 'Hotel to clustered attractions',
          estimatedDuration: '30-60 minutes between zones',
          estimatedCostInr: 900
        }
      ],
      staySuggestions: [
        {
          area: 'central / well-connected area',
          type: dto.preferences?.stayPreference ?? 'comfort hotel',
          nightlyBudgetInr: dto.vibe === 'luxury' ? 12000 : dto.vibe === 'comfort' ? 4500 : 1200,
          why: 'Reduces commute fatigue and keeps dinner options nearby.'
        }
      ],
      foodRecommendations: [dto.preferences?.foodPreference ?? 'regional thali', 'street food with strong recent reviews'],
      localTips: ['Pre-book popular experiences in peak season.', 'Carry a small cash backup for local vendors.']
    },
    {
      city: 'Jaipur',
      country: 'India',
      days: Math.max(1, dto.days - 2),
      estimatedCostUsd: dto.vibe === 'luxury' ? 22000 : dto.vibe === 'comfort' ? 11500 : 4500,
      estimatedCostInr: dto.vibe === 'luxury' ? 22000 : dto.vibe === 'comfort' ? 11500 : 4500,
      dailyBreakdown: [
        {
          day: Math.max(2, dto.days),
          date: null,
          baseCity: 'Jaipur',
          morning: 'Fort circuit or primary outdoor attraction.',
          afternoon: 'Lunch, palace or museum, then market time.',
          evening: 'Rooftop dinner or cultural performance.',
          transport: 'Private cab for spread-out sights, walking inside market zones.',
          meals: ['Rajasthani thali', 'lassi or cafe stop'],
          estimatedCostInr: dto.vibe === 'luxury' ? 8500 : dto.vibe === 'comfort' ? 4300 : 1800,
          travelTime: '2-3 hours local movement'
        }
      ],
      activities: [
        { name: 'Fort and palace circuit', category: 'sightseeing', costUsd: 2200, durationHours: 4 },
        { name: 'Bazaar photography walk', category: 'cultural', costUsd: 900, durationHours: 2 }
      ],
      transportation: [],
      staySuggestions: [],
      foodRecommendations: ['regional thali', 'old-city snacks'],
      localTips: ['Start fort visits early to avoid heat and queues.']
    }
  ]
});

export const fallbackPacking = (_dto: PackingSuggestionDto): PackingList[] => [
  { category: 'documents', items: ['Government ID', 'Hotel confirmations', 'Emergency contacts'] },
  { category: 'clothing', items: ['Comfortable walking shoes', 'Light layers', 'Rain jacket'] },
  { category: 'health', items: ['Personal medicines', 'Sunscreen', 'Reusable water bottle'] },
  { category: 'electronics', items: ['Phone charger', 'Power bank', 'Travel adapter'] }
];

export const fallbackBudget = (dto: BudgetEstimateDto): BudgetEstimate => {
  const multiplier = dto.vibe === 'luxury' ? 2.2 : dto.vibe === 'comfort' ? 1.35 : 0.75;
  const accommodationInr = Math.round(4500 * multiplier);
  const foodInr = Math.round(1600 * multiplier);
  const transportInr = Math.round(1200 * multiplier);
  const activitiesInr = Math.round(2400 * multiplier);
  return {
    cityId: dto.cityId ?? 'context',
    cityName: dto.cityName,
    currency: 'INR',
    perDayInr: accommodationInr + foodInr + transportInr + activitiesInr,
    accommodationInr,
    foodInr,
    transportInr,
    activitiesInr,
    confidence: 'fallback',
    notes: [
      'Estimate uses Traveloop fallback pricing because live AI was unavailable.',
      'Adjust stay and activity costs after you pick exact hotels and experiences.'
    ]
  };
};
