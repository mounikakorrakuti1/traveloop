import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must include uppercase, lowercase, and number'
  });

const optionalUrlSchema = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.string().trim().url().max(2000).optional()
);

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return value;
    const normalized = value.replace(/[\s().-]/g, '');
    return normalized.length === 0 ? undefined : normalized;
  },
  z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, {
      message: 'Phone number must include 8 to 15 digits and may start with +'
    })
    .optional()
);

export const registerDto = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
    password: passwordSchema,
    confirmPassword: z.string().min(8).max(128),
    name: z.string().trim().min(2).max(100),
    phoneNumber: optionalPhoneSchema,
    avatarUrl: optionalUrlSchema,
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
    email: z.string().trim().toLowerCase().email().max(255)
  })
  .strict();

export const resetPasswordDto = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
    otp: z.string().regex(/^\d{6}$/),
    newPassword: passwordSchema
  })
  .strict();

export const updateProfileDto = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    username: z
      .preprocess(
        (value) => (value === '' || value === null ? undefined : value),
        z
          .string()
          .trim()
          .toLowerCase()
          .min(3)
          .max(40)
          .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
          .optional()
      ),
    phoneNumber: optionalPhoneSchema,
    avatarUrl: optionalUrlSchema,
    bio: z.string().trim().max(500).optional(),
    travelerProfile: z.enum(['solo', 'couple', 'family', 'senior', 'group']).optional(),
    preferredBudgetMin: z.number().nonnegative().max(10000000).optional(),
    preferredBudgetMax: z.number().nonnegative().max(10000000).optional(),
    travelStyles: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
    travelPreferences: z.record(z.unknown()).optional()
  })
  .strict()
  .refine(
    (value) =>
      value.preferredBudgetMin === undefined ||
      value.preferredBudgetMax === undefined ||
      value.preferredBudgetMax >= value.preferredBudgetMin,
    {
      message: 'Preferred max budget must be greater than or equal to preferred min budget',
      path: ['preferredBudgetMax']
    }
  );

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordDto>;
export type ResetPasswordDto = z.infer<typeof resetPasswordDto>;
export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
