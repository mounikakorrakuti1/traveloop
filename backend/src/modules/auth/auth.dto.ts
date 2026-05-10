import { z } from 'zod';

export const registerDto = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    name: z.string().min(1).max(100),
    travelerProfile: z.enum(['solo', 'couple', 'family', 'senior', 'group']).default('solo')
  })
  .strict();

export const loginDto = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(1).max(128)
  })
  .strict();

export const forgotPasswordDto = z
  .object({
    email: z.string().email().max(255)
  })
  .strict();

export const resetPasswordDto = z
  .object({
    email: z.string().email().max(255),
    otp: z.string().regex(/^\d{6}$/),
    newPassword: z.string().min(8).max(128)
  })
  .strict();

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
