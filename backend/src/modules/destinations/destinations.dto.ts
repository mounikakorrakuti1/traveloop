import { z } from 'zod';

export const destinationCityParamsDto = z.object({ cityId: z.string().uuid() }).strict();

export const transportSearchQueryDto = z
  .object({
    origin: z.string().trim().min(2).max(120),
    destination: z.string().trim().min(2).max(120),
    departureDate: z.string().trim().min(8).max(40),
    mode: z.enum(['flight', 'train', 'bus', 'all']).default('all')
  })
  .strict();

export type TransportSearchQueryDto = z.infer<typeof transportSearchQueryDto>;
