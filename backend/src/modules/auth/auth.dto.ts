import { z } from 'zod';

export const registerDto = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
    password: z
      .string()
      .min(8)
      .max(128)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'Password must include uppercase, lowercase, and number'
      }),
    confirmPassword: z.string().min(8).max(128),
    name: z.string().trim().min(2).max(100),
    avatarUrl: z.string().url().max(2000),
    travelerProfile: z.enum(['solo', 'couple', 'family', 'senior', 'group']).default('solo')
  })
  .strict()
  .superRefine((dto, ctx) => {
    if (dto.password !== dto.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Confirm password must match password'
      });
    }
  });

export const loginDto = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
    password: z.string().min(8).max(128)
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
