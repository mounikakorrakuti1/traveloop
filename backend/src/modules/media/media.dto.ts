import { z } from 'zod';

export const mediaParamsDto = z
  .object({
    id: z.string().uuid(),
    mediaId: z.string().uuid().optional()
  })
  .strict();

export const signUploadDto = z
  .object({
    folder: z.string().min(1).max(120).default('traveloop'),
    resourceType: z.enum(['image', 'video', 'auto']).default('auto')
  })
  .strict();

export const createMediaDto = z
  .object({
    stopId: z.string().uuid().optional(),
    mediaType: z.enum(['photo', 'video']),
    cloudinaryUrl: z.string().url(),
    cloudinaryId: z.string().min(1).max(255),
    caption: z.string().max(1000).optional()
  })
  .strict();

export type SignUploadDto = z.infer<typeof signUploadDto>;
export type CreateMediaDto = z.infer<typeof createMediaDto>;
