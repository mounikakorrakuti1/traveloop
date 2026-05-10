import { z } from 'zod';

export const cityIdParamsDto = z.object({ id: z.string().uuid() }).strict();

export const listCitiesQueryDto = z
  .object({
    q: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).optional(),
    region: z.string().trim().min(1).optional(),
    costIndex: z.enum(['low', 'medium', 'high']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
  })
  .strict();

export type ListCitiesQueryDto = z.infer<typeof listCitiesQueryDto>;
