import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { User as PrismaUser } from '@prisma/client';
import type { User } from '../../../shared/types';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';
import { logger } from '../../utils/logger';
import { authRepository } from './auth.repository';
import type { ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';

interface AuthResult {
  user: User;
  token: string;
}

const mapUser = (user: PrismaUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name,
  avatarUrl: user.avatarUrl,
  travelerProfile: user.travelerProfile as User['travelerProfile'],
  isAdmin: user.isAdmin,
  createdAt: user.createdAt.toISOString()
});

export class AuthService {
  public async register(dto: RegisterDto): Promise<AuthResult> {
    const existingUser = await authRepository.findByEmail(dto.email.toLowerCase());
    if (existingUser) {
      throw new AppError('Email is already registered', 'CONFLICT', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await authRepository.createUser({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      travelerProfile: dto.travelerProfile
    });

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

  public async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await authRepository.findByEmail(dto.email.toLowerCase());
    if (!user) {
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await authRepository.updateOtp(user.id, otpHash, expiresAt);

    logger.info('Password reset OTP generated', { userId: user.id, action: 'PASSWORD_RESET_OTP' });
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

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await authRepository.updatePasswordAndClearOtp(user.id, passwordHash);
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
