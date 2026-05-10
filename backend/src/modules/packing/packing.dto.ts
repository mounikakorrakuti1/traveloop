import { z } from 'zod';

export const packingParamsDto = z
  .object({
    id: z.string().uuid(),
    itemId: z.string().uuid().optional()
  })
  .strict();

const packingItemBodyDto = z
  .object({
    name: z.string().min(1).max(255),
    category: z.string().min(1).max(50),
    isPacked: z.boolean().default(false),
    aiSuggested: z.boolean().default(false)
  })
  .strict();

export const createPackingItemDto = packingItemBodyDto;
export const updatePackingItemDto = packingItemBodyDto.partial().strict();

export type CreatePackingItemDto = z.infer<typeof createPackingItemDto>;
export type UpdatePackingItemDto = z.infer<typeof updatePackingItemDto>;
