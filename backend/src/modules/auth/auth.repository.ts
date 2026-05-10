import type { User } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class AuthRepository {
  public findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  public findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  public createUser(input: {
    email: string;
    passwordHash: string;
    name: string;
    avatarUrl: string;
    travelerProfile: string;
  }): Promise<User> {
    return prisma.user.create({
      data: input
    });
  }

  public updateOtp(userId: string, otpHash: string, otpExpiresAt: Date): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { otpHash, otpExpiresAt }
    });
  }

  public updatePasswordAndClearOtp(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash, otpHash: null, otpExpiresAt: null }
    });
  }
}

export const authRepository = new AuthRepository();
