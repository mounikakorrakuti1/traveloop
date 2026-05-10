import { z } from 'zod';

export const mediaParamsDto = z
  .object({
    id: z.string().uuid(),
    mediaId: z.string().uuid().optional()
  })
  .strict();

export const signUploadDto = z
  .object({
    folder: z
      .string()
      .min(1)
      .max(120)
      .regex(/^traveloop(\/[a-zA-Z0-9_-]+)*$/, 'folder must be inside the traveloop namespace')
      .default('traveloop'),
    resourceType: z.enum(['image', 'video', 'raw']).default('image')
  })
  .strict();

export const createMediaDto = z
  .object({
    stopId: z.string().uuid().optional(),
    mediaType: z.enum(['photo', 'video', 'document']),
    cloudinaryUrl: z.string().url(),
    cloudinaryId: z.string().min(1).max(255),
    caption: z.string().max(1000).optional(),
    documentType: z
      .enum(['passport', 'visa', 'ticket', 'hotel', 'insurance', 'custom'])
      .optional(),
    fileName: z.string().trim().min(1).max(255).optional(),
    fileSizeBytes: z.number().int().positive().max(25 * 1024 * 1024).optional(),
    mimeType: z
      .string()
      .regex(/^(application\/pdf|image\/(png|jpeg|jpg|webp)|text\/plain)$/)
      .optional(),
    expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  })
  .strict()
  .refine((value) => value.mediaType !== 'document' || Boolean(value.documentType && value.fileName), {
    message: 'documentType and fileName are required for documents',
    path: ['documentType']
  });

export type SignUploadDto = z.infer<typeof signUploadDto>;
export type CreateMediaDto = z.infer<typeof createMediaDto>;
