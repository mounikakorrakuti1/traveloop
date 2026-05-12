import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middleware/error-handler';
import { logger } from '../../utils/logger';
import { notificationsService } from '../notifications/notifications.service';
import type { RequestProfileVerificationOtpDto, VerifyProfileOtpDto } from './users.dto';

export class UsersService {
  public async requestDeleteAccountOtp(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        isDeleted: true,
        deletedAt: true
      }
    });

    if (!user || user.isDeleted || user.deletedAt) {
      throw new AppError('Account not found', 'NOT_FOUND', 404);
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: { deleteOtpHash: otpHash, deleteOtpExpiresAt: otpExpiresAt }
    });

    await notificationsService.sendAccountDeletionOtpEmail(user.email, user.name, otp);

    if (user.phoneNumber) {
      await Promise.allSettled([
        notificationsService.sendAccountDeletionOtpSms(user.phoneNumber, otp),
        notificationsService.sendAccountDeletionOtpWhatsApp(user.phoneNumber, otp)
      ]).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            logger.warn('Optional account deletion phone OTP failed', {
              userId,
              channel: index === 0 ? 'sms' : 'whatsapp',
              error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
            });
          }
        });
      });
    }
  }

  public async requestProfileVerificationOtp(userId: string, dto: RequestProfileVerificationOtpDto): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        isDeleted: true,
        deletedAt: true
      }
    });

    if (!user || user.isDeleted || user.deletedAt) {
      throw new AppError('Account not found', 'NOT_FOUND', 404);
    }

    if (dto.target === 'phone' && !user.phoneNumber) {
      throw new AppError('Add a phone number before verifying it', 'VALIDATION_ERROR', 400, {
        phoneNumber: ['Phone number is required']
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (dto.target === 'email') {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerificationOtpHash: otpHash, emailVerificationOtpExpiresAt: expiresAt }
      });
      await notificationsService.sendProfileEmailVerificationOtp(user.email, user.name, otp);
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerificationOtpHash: otpHash, phoneVerificationOtpExpiresAt: expiresAt }
    });
    const channel = dto.channel === 'whatsapp' ? 'whatsapp' : 'sms';
    await notificationsService.sendProfilePhoneVerificationOtp(user.phoneNumber!, otp, channel);
  }

  public async verifyProfileOtp(userId: string, dto: VerifyProfileOtpDto): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isDeleted: true,
        deletedAt: true,
        emailVerificationOtpHash: true,
        emailVerificationOtpExpiresAt: true,
        phoneVerificationOtpHash: true,
        phoneVerificationOtpExpiresAt: true
      }
    });

    if (!user || user.isDeleted || user.deletedAt) {
      throw new AppError('Account not found', 'NOT_FOUND', 404);
    }

    const otpHash = dto.target === 'email' ? user.emailVerificationOtpHash : user.phoneVerificationOtpHash;
    const otpExpiresAt = dto.target === 'email' ? user.emailVerificationOtpExpiresAt : user.phoneVerificationOtpExpiresAt;

    if (!otpHash || !otpExpiresAt || otpExpiresAt.getTime() < Date.now()) {
      throw new AppError('Invalid or expired OTP', 'UNAUTHORIZED', 401);
    }

    const validOtp = await bcrypt.compare(dto.otp, otpHash);
    if (!validOtp) {
      throw new AppError('Invalid or expired OTP', 'UNAUTHORIZED', 401);
    }

    await prisma.user.update({
      where: { id: userId },
      data:
        dto.target === 'email'
          ? {
              emailVerifiedAt: new Date(),
              emailVerificationOtpHash: null,
              emailVerificationOtpExpiresAt: null
            }
          : {
              phoneVerifiedAt: new Date(),
              phoneVerificationOtpHash: null,
              phoneVerificationOtpExpiresAt: null
            }
    });
  }

  public async deleteAccount(userId: string, otp: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isDeleted: true,
        deletedAt: true,
        deleteOtpHash: true,
        deleteOtpExpiresAt: true
      }
    });

    if (!user || user.isDeleted || user.deletedAt) {
      throw new AppError('Account not found', 'NOT_FOUND', 404);
    }

    if (!user.deleteOtpHash || !user.deleteOtpExpiresAt || user.deleteOtpExpiresAt.getTime() < Date.now()) {
      throw new AppError('Invalid or expired OTP', 'UNAUTHORIZED', 401);
    }
    const validOtp = await bcrypt.compare(otp, user.deleteOtpHash);
    if (!validOtp) {
      throw new AppError('Invalid or expired OTP', 'UNAUTHORIZED', 401);
    }

    const deletedAt = new Date();
    await prisma.$transaction([
      prisma.communityLike.deleteMany({ where: { userId } }),
      prisma.communityBookmark.deleteMany({ where: { userId } }),
      prisma.communityComment.deleteMany({ where: { userId } }),
      prisma.communityPost.deleteMany({ where: { userId } }),
      prisma.mediaUpload.deleteMany({ where: { userId } }),
      prisma.passwordResetOtp.deleteMany({ where: { userId } }),
      prisma.trip.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt, isPublic: false, publicSlug: null }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { isDeleted: true, deletedAt, deleteOtpHash: null, deleteOtpExpiresAt: null }
      })
    ]);
  }
}

export const usersService = new UsersService();
