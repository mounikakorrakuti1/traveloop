import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const tripStopParamsDto = z
  .object({
    id: z.string().uuid(),
    stopId: z.string().uuid().optional()
  })
  .strict();

const stopBodyDto = z
  .object({
    cityId: z.string().uuid(),
    orderIndex: z.number().int().nonnegative(),
    arrivalDate: dateString,
    departureDate: dateString,
    notes: z.string().max(5000).optional(),
    accommodationName: z.string().max(255).optional(),
    accommodationCost: z.number().nonnegative().optional()
  })
  .strict();

export const createStopDto = stopBodyDto.refine((value) => value.departureDate >= value.arrivalDate, {
    message: 'departureDate must be on or after arrivalDate',
    path: ['departureDate']
  });

export const updateStopDto = stopBodyDto
  .partial()
  .strict()
  .refine(
    (value): boolean =>
      !value.arrivalDate || !value.departureDate || value.departureDate >= value.arrivalDate,
    {
      message: 'departureDate must be on or after arrivalDate',
      path: ['departureDate']
    }
  );

export const reorderStopsDto = z
  .object({
    stopOrders: z.array(
      z
        .object({
          id: z.string().uuid(),
          orderIndex: z.number().int().nonnegative()
        })
        .strict()
    )
  })
  .strict();

export type CreateStopDto = z.infer<typeof createStopDto>;
export type UpdateStopDto = z.infer<typeof updateStopDto>;
export type ReorderStopsDto = z.infer<typeof reorderStopsDto>;
