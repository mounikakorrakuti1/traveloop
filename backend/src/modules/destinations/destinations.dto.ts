import { z } from 'zod';

export const destinationCityParamsDto = z.object({ cityId: z.string().uuid() }).strict();
export const destinationNameParamsDto = z.object({ name: z.string().trim().min(2).max(120) }).strict();
export const weatherCityParamsDto = z.object({ city: z.string().trim().min(2).max(120) }).strict();
export const nearbyQueryDto = z
  .object({
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
    radiusKm: z.coerce.number().positive().max(1000).default(250)
  })
  .strict();

export const transportSearchQueryDto = z
  .object({
    origin: z.string().trim().min(2).max(120),
    destination: z.string().trim().min(2).max(120),
    departureDate: z.string().trim().min(8).max(40),
    mode: z.enum(['flight', 'train', 'bus', 'all']).default('all')
  })
  .strict();

export type TransportSearchQueryDto = z.infer<typeof transportSearchQueryDto>;
export type DestinationNameParamsDto = z.infer<typeof destinationNameParamsDto>;
export type NearbyQueryDto = z.infer<typeof nearbyQueryDto>;
