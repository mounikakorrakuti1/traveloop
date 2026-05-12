import { z } from 'zod';

const locationContextDto = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    city: z.string().max(80).optional(),
    country: z.string().max(80).optional()
  })
  .strict();

const aiUserContextDto = z
  .object({
    travelStyle: z.array(z.string().max(40)).max(12).optional(),
    interests: z.array(z.string().max(50)).max(20).optional(),
    budget: z
      .object({
        min: z.number().nonnegative().optional(),
        max: z.number().nonnegative().optional(),
        currency: z.string().max(10).optional()
      })
      .strict()
      .optional(),
    foodPreference: z.string().max(80).optional(),
    climatePreference: z.string().max(80).optional(),
    previousTrips: z.array(z.string().max(120)).max(10).optional(),
    groupSize: z.number().int().positive().max(30).optional(),
    currentLocation: locationContextDto.optional()
  })
  .strict();

const tripPlannerPreferencesDto = z
  .object({
    source: z.string().max(120).optional(),
    destination: z.string().max(160).optional(),
    startDate: z.string().max(40).optional(),
    endDate: z.string().max(40).optional(),
    placesToCover: z.array(z.string().max(120)).max(30).optional(),
    stayPreference: z.string().max(80).optional(),
    transportationPreferences: z.array(z.string().max(40)).max(8).optional(),
    specificDateTimePreferences: z.string().max(500).optional(),
    foodPreference: z.string().max(80).optional(),
    budgetInr: z.number().nonnegative().optional()
  })
  .strict();

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
    ]),
    preferences: tripPlannerPreferencesDto.optional(),
    userContext: aiUserContextDto.optional()
  })
  .strict();

export const packingSuggestionDto = z
  .object({
    destination: z.string().min(1).max(255),
    days: z.number().int().positive().max(60),
    tripType: z.string().min(1).max(50),
    season: z.string().max(100).optional(),
    userContext: aiUserContextDto.optional()
  })
  .strict();

export const budgetEstimateDto = z
  .object({
    cityId: z.string().uuid().optional(),
    cityName: z.string().min(1).max(100),
    vibe: z.enum(['backpacker', 'comfort', 'luxury']).default('comfort'),
    tripType: z.string().max(50).optional(),
    days: z.number().int().positive().max(60).optional(),
    userContext: aiUserContextDto.optional()
  })
  .strict();

export type ItineraryDto = z.infer<typeof itineraryDto>;
export type PackingSuggestionDto = z.infer<typeof packingSuggestionDto>;
export type BudgetEstimateDto = z.infer<typeof budgetEstimateDto>;
