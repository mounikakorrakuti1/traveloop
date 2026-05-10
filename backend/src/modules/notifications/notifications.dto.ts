import { z } from 'zod';

export const sendEmailDto = z
  .object({
    to: z.string().email(),
    subject: z.string().min(1).max(200),
    text: z.string().min(1).max(5000),
    html: z.string().max(10000).optional()
  })
  .strict();

export const sendPhoneMessageDto = z
  .object({
    to: z.string().min(8).max(30),
    message: z.string().min(1).max(1600)
  })
  .strict();

export type SendEmailDto = z.infer<typeof sendEmailDto>;
export type SendPhoneMessageDto = z.infer<typeof sendPhoneMessageDto>;
