import type { Prisma, User } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class AuthRepository {
  public findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  public findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  public findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  public createUser(input: {
    email: string;
    passwordHash: string;
    name: string;
    phoneNumber?: string;
    avatarUrl?: string;
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

  public updateProfile(userId: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data
    });
  }
}

export const authRepository = new AuthRepository();
