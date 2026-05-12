import type { BudgetEstimate, GeneratedItinerary, PackingList } from '../../../shared/types';
import type { BudgetEstimateDto, ItineraryDto, PackingSuggestionDto } from './ai.dto';

export const fallbackItinerary = (dto: ItineraryDto): GeneratedItinerary => ({
  stops: [
    {
      city: 'Delhi',
      country: 'India',
      days: Math.max(1, Math.min(dto.days, 2)),
      estimatedCostUsd: dto.vibe === 'luxury' ? 18000 : dto.vibe === 'comfort' ? 9500 : 3800,
      activities: [
        { name: 'Heritage walk', category: 'cultural', costUsd: 1500, durationHours: 2.5 },
        { name: 'Local food trail', category: 'food', costUsd: 1800, durationHours: 3 }
      ]
    },
    {
      city: 'Jaipur',
      country: 'India',
      days: Math.max(1, dto.days - 2),
      estimatedCostUsd: dto.vibe === 'luxury' ? 22000 : dto.vibe === 'comfort' ? 11500 : 4500,
      activities: [
        { name: 'Fort and palace circuit', category: 'sightseeing', costUsd: 2200, durationHours: 4 },
        { name: 'Bazaar photography walk', category: 'cultural', costUsd: 900, durationHours: 2 }
      ]
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
