import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { Prisma, User as PrismaUser } from '@prisma/client';
import type { User } from '../../../shared/types';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';
import { logger } from '../../utils/logger';
import { notificationsService } from '../notifications/notifications.service';
import { authRepository } from './auth.repository';
import type { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto, UpdateProfileDto } from './auth.dto';

interface AuthResult {
  user: User;
  token: string;
}

const mapUser = (user: PrismaUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name,
  username: user.username,
  phoneNumber: user.phoneNumber,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  travelerProfile: user.travelerProfile as User['travelerProfile'],
  preferredBudgetMin: user.preferredBudgetMin ? Number(user.preferredBudgetMin) : null,
  preferredBudgetMax: user.preferredBudgetMax ? Number(user.preferredBudgetMax) : null,
  travelStyles: Array.isArray(user.travelStyles) ? (user.travelStyles as string[]) : [],
  travelPreferences:
    user.travelPreferences && typeof user.travelPreferences === 'object'
      ? (user.travelPreferences as Record<string, unknown>)
      : null,
  isAdmin: user.isAdmin,
  createdAt: user.createdAt.toISOString()
});

const normalizePhoneNumber = (phoneNumber?: string): string | undefined => {
  if (!phoneNumber) return undefined;
  const normalized = phoneNumber.replace(/[\s().-]/g, '');
  return normalized.length > 0 ? normalized : undefined;
};

export class AuthService {
  public async register(dto: RegisterDto): Promise<AuthResult> {
    if (dto.password !== dto.confirmPassword) {
      throw new AppError('Confirm password must match password', 'VALIDATION_ERROR', 400, {
        confirmPassword: ['Confirm password must match password']
      });
    }

    const existingUser = await authRepository.findByEmail(dto.email.toLowerCase());
    if (existingUser) {
      throw new AppError('Email is already registered', 'CONFLICT', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const phoneNumber = normalizePhoneNumber(dto.phoneNumber);
    const createInput = {
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      travelerProfile: dto.travelerProfile
    };
    const user = await authRepository.createUser({
      ...createInput,
      ...(phoneNumber ? { phoneNumber } : {}),
      ...(dto.avatarUrl ? { avatarUrl: dto.avatarUrl } : {})
    });

    try {
      await notificationsService.sendRegistrationWelcome(user.email, user.name);
      logger.info('Registration welcome email sent', { userId: user.id, action: 'REGISTRATION_WELCOME' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown notification error';
      logger.warn('Registration welcome email failed', {
        userId: user.id,
        action: 'REGISTRATION_WELCOME_FAILED',
        error: message
      });
    }

    return { user: mapUser(user), token: this.signToken(user) };
  }

  public async login(dto: LoginDto): Promise<AuthResult> {
    const user = await authRepository.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new AppError('Invalid credentials', 'UNAUTHORIZED', 401);
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid credentials', 'UNAUTHORIZED', 401);
    }

    return { user: mapUser(user), token: this.signToken(user) };
  }

  public async me(userId: string): Promise<User> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 'NOT_FOUND', 404);
    }

    return mapUser(user);
  }

  public async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const existingUser = await authRepository.findById(userId);
    if (!existingUser) {
      throw new AppError('User not found', 'NOT_FOUND', 404);
    }

    if (dto.username && dto.username !== existingUser.username) {
      const usernameOwner = await authRepository.findByUsername(dto.username);
      if (usernameOwner && usernameOwner.id !== userId) {
        throw new AppError('Username is already taken', 'CONFLICT', 409);
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.username !== undefined) data.username = dto.username;
    if (dto.phoneNumber !== undefined) data.phoneNumber = normalizePhoneNumber(dto.phoneNumber) ?? null;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.travelerProfile !== undefined) data.travelerProfile = dto.travelerProfile;
    if (dto.preferredBudgetMin !== undefined) data.preferredBudgetMin = dto.preferredBudgetMin;
    if (dto.preferredBudgetMax !== undefined) data.preferredBudgetMax = dto.preferredBudgetMax;
    if (dto.travelStyles !== undefined) data.travelStyles = dto.travelStyles;
    if (dto.travelPreferences !== undefined) {
      data.travelPreferences = dto.travelPreferences as Prisma.InputJsonValue;
    }

    const user = await authRepository.updateProfile(userId, data);
    return mapUser(user);
  }

  public async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await authRepository.findByEmail(dto.email.toLowerCase());
    if (!user) {
      // Silent return — don't reveal whether email exists
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await authRepository.updateOtp(user.id, otpHash, expiresAt);

    try {
      await notificationsService.sendPasswordResetOtp(user.email, otp);
      logger.info('Password reset OTP sent', { userId: user.id, action: 'PASSWORD_RESET_OTP' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send password reset OTP email', {
        userId: user.id,
        action: 'PASSWORD_RESET_OTP_FAILED',
        error: message
      });
      // Re-throw so the user knows the email didn't go through
      throw new AppError(
        'Unable to send the reset email. Please try again in a minute.',
        'EMAIL_DELIVERY_FAILED',
        502
      );
    }
  }

  public async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await authRepository.findByEmail(dto.email.toLowerCase());
    if (!user || !user.otpHash || !user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      throw new AppError('Invalid or expired OTP', 'UNAUTHORIZED', 401);
    }

    const validOtp = await bcrypt.compare(dto.otp, user.otpHash);
    if (!validOtp) {
      throw new AppError('Invalid or expired OTP', 'UNAUTHORIZED', 401);
    }

    const samePassword = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (samePassword) {
      throw new AppError('New password must be different from the current password', 'VALIDATION_ERROR', 400, {
        newPassword: ['New password must be different from the current password']
      });
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await authRepository.updatePasswordAndClearOtp(user.id, passwordHash);

    // Send password-changed confirmation email (non-blocking)
    try {
      await notificationsService.sendPasswordChangedConfirmation(user.email, user.name);
      logger.info('Password changed confirmation sent', { userId: user.id, action: 'PASSWORD_CHANGED' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.warn('Password changed confirmation email failed', {
        userId: user.id,
        action: 'PASSWORD_CHANGED_EMAIL_FAILED',
        error: message
      });
      // Don't throw — password was already changed successfully
    }
  }

  private signToken(user: PrismaUser): string {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>
    };

    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.isAdmin ? 'admin' : 'user',
        isAdmin: user.isAdmin
      },
      env.JWT_SECRET,
      options
    );
  }
}

export const authService = new AuthService();
