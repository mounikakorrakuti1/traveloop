import { z } from 'zod';

export const listCommunityQueryDto = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(30).default(12)
  })
  .strict();

export const createCommunityPostDto = z
  .object({
    title: z.string().trim().min(8).max(180),
    content: z.string().trim().min(20).max(4000),
    heroImageUrl: z.string().trim().url().max(2000).optional(),
    destinationName: z.string().trim().min(2).max(120).optional(),
    budgetInr: z.number().nonnegative().max(50000000).optional(),
    tripId: z.string().uuid().optional()
  })
  .strict();

export const addCommunityCommentDto = z
  .object({
    body: z.string().trim().min(2).max(1200)
  })
  .strict();

export const postIdParamsDto = z.object({ postId: z.string().uuid() }).strict();

export type ListCommunityQueryDto = z.infer<typeof listCommunityQueryDto>;
export type CreateCommunityPostDto = z.infer<typeof createCommunityPostDto>;
export type AddCommunityCommentDto = z.infer<typeof addCommunityCommentDto>;
