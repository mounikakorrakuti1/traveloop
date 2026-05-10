import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const tripIdParamsDto = z.object({ id: z.string().uuid() }).strict();

export const listTripsQueryDto = z
  .object({
    status: z.enum(['planning', 'confirmed', 'ongoing', 'completed']).optional(),
    sort: z.enum(['createdAt', 'startDate', 'title']).default('createdAt'),
    search: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
  })
  .strict();

const tripBodyDto = z
  .object({
    title: z.string().min(1).max(255),
    description: z.string().max(5000).optional(),
    coverPhotoUrl: z.string().url().optional(),
    startDate: dateString,
    endDate: dateString,
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
    budgetCapUsd: z.number().nonnegative().optional(),
    vibe: z.enum(['backpacker', 'comfort', 'luxury']).optional()
  })
  .strict();

export const createTripDto = tripBodyDto.refine((value) => value.endDate >= value.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate']
  });

export const updateTripDto = tripBodyDto
  .partial()
  .extend({
    status: z.enum(['planning', 'confirmed', 'ongoing', 'completed']).optional()
  })
  .strict()
  .refine((value): boolean => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate']
  });

export const publishTripDto = z.object({ isPublic: z.boolean() }).strict();

export type ListTripsQueryDto = z.infer<typeof listTripsQueryDto>;
export type CreateTripDto = z.infer<typeof createTripDto>;
export type UpdateTripDto = z.infer<typeof updateTripDto>;
export type PublishTripDto = z.infer<typeof publishTripDto>;
