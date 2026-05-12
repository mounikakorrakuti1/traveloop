import { z } from 'zod';

export const requestDeleteAccountOtpDto = z.object({}).strict();

export const deleteAccountDto = z
  .object({
    otp: z.string().regex(/^\d{6}$/)
  })
  .strict();

export const requestProfileVerificationOtpDto = z
  .object({
    target: z.enum(['email', 'phone']),
    channel: z.enum(['email', 'sms', 'whatsapp']).optional()
  })
  .strict()
  .refine((value) => (value.target === 'email' ? value.channel === undefined || value.channel === 'email' : value.channel === 'sms' || value.channel === 'whatsapp'), {
    message: 'Choose email for email verification, or SMS/WhatsApp for phone verification',
    path: ['channel']
  });

export const verifyProfileOtpDto = z
  .object({
    target: z.enum(['email', 'phone']),
    otp: z.string().regex(/^\d{6}$/)
  })
  .strict();

export type RequestDeleteAccountOtpDto = z.infer<typeof requestDeleteAccountOtpDto>;
export type DeleteAccountDto = z.infer<typeof deleteAccountDto>;
export type RequestProfileVerificationOtpDto = z.infer<typeof requestProfileVerificationOtpDto>;
export type VerifyProfileOtpDto = z.infer<typeof verifyProfileOtpDto>;
