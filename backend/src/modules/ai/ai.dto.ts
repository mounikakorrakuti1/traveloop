import { z } from 'zod';

export const itineraryDto = z
  .object({
    prompt: z.string().min(1).max(2000),
    days: z.number().int().positive().max(30),
    vibe: z.enum(['backpacker', 'comfort', 'luxury']).default('comfort'),
    tripType: z.enum([
      'solo',
      'couple',
      'family',
      'group',
      'adventure',
      'pilgrimage',
      'honeymoon',
      'business'
    ])
  })
  .strict();

export const packingSuggestionDto = z
  .object({
    destination: z.string().min(1).max(255),
    days: z.number().int().positive().max(60),
    tripType: z.string().min(1).max(50),
    season: z.string().max(100).optional()
  })
  .strict();

export const budgetEstimateDto = z
  .object({
    cityId: z.string().uuid(),
    cityName: z.string().min(1).max(100),
    vibe: z.enum(['backpacker', 'comfort', 'luxury']).default('comfort')
  })
  .strict();

export type ItineraryDto = z.infer<typeof itineraryDto>;
export type PackingSuggestionDto = z.infer<typeof packingSuggestionDto>;
export type BudgetEstimateDto = z.infer<typeof budgetEstimateDto>;
