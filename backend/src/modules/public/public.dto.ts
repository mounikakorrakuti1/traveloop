import { z } from 'zod';

export const publicTripParamsDto = z.object({ slug: z.string().min(1).max(100) }).strict();
