import { z } from 'zod';

export const tripNoteParamsDto = z
  .object({
    id: z.string().uuid(),
    noteId: z.string().uuid().optional()
  })
  .strict();

const noteBodyDto = z
  .object({
    stopId: z.string().uuid().optional(),
    title: z.string().min(1).max(255),
    content: z.string().min(1).max(10000),
    noteType: z.string().min(1).max(20).default('general'),
    isImportant: z.boolean().default(false)
  })
  .strict();

export const createNoteDto = noteBodyDto;
export const updateNoteDto = noteBodyDto.partial().strict();

export type CreateNoteDto = z.infer<typeof createNoteDto>;
export type UpdateNoteDto = z.infer<typeof updateNoteDto>;
