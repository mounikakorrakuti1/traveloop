import { z } from 'zod';

export const activityIdParamsDto = z.object({ id: z.string().uuid() }).strict();

export const listActivitiesQueryDto = z
  .object({
    cityId: z.string().uuid().optional(),
    category: z.string().trim().min(1).optional(),
    maxCost: z.coerce.number().nonnegative().optional(),
    tripType: z.string().trim().min(1).optional(),
    q: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
  })
  .strict();

export const assignActivityParamsDto = z
  .object({
    id: z.string().uuid(),
    stopId: z.string().uuid()
  })
  .strict();

export const stopActivityParamsDto = assignActivityParamsDto
  .extend({
    saId: z.string().uuid()
  })
  .strict();

export const assignActivityDto = z
  .object({
    activityId: z.string().uuid(),
    scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/).optional(),
    actualCostUsd: z.number().nonnegative().optional()
  })
  .strict();

export type ListActivitiesQueryDto = z.infer<typeof listActivitiesQueryDto>;
export type AssignActivityDto = z.infer<typeof assignActivityDto>;
