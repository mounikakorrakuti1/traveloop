import type { User as PrismaUser } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../src/middleware/error-handler';
import { authService } from '../src/modules/auth/auth.service';
import { authRepository } from '../src/modules/auth/auth.repository';
import { notificationsService } from '../src/modules/notifications/notifications.service';

jest.mock('../src/modules/auth/auth.repository', () => ({
  authRepository: {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    findById: jest.fn(),
    updateOtp: jest.fn(),
    updatePasswordAndClearOtp: jest.fn()
  }
}));

jest.mock('../src/modules/notifications/notifications.service', () => ({
  notificationsService: {
    sendRegistrationWelcome: jest.fn(),
    sendPasswordResetOtp: jest.fn()
  }
}));

const mockedAuthRepository = authRepository as jest.Mocked<typeof authRepository>;
const mockedNotificationsService = notificationsService as jest.Mocked<typeof notificationsService>;

const prismaUser: PrismaUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'tester@traveloop.test',
  passwordHash: 'hashed-password',
  name: 'Test Traveler',
  phoneNumber: '+919876543210',
  avatarUrl: 'https://example.com/avatar.jpg',
  travelerProfile: 'solo',
  language: 'en',
  isAdmin: false,
  otpHash: null,
  otpExpiresAt: null,
  createdAt: new Date('2026-05-10T00:00:00.000Z'),
  updatedAt: new Date('2026-05-10T00:00:00.000Z')
};

const registrationDto = {
  email: 'TESTER@TRAVELOOP.TEST',
  password: 'Password123',
  confirmPassword: 'Password123',
  name: 'Test Traveler',
  phoneNumber: '+91 98765 43210',
  avatarUrl: 'https://example.com/avatar.jpg',
  travelerProfile: 'solo' as const
};

describe('authService.register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAuthRepository.findByEmail.mockResolvedValue(null);
    mockedAuthRepository.createUser.mockResolvedValue(prismaUser);
    mockedNotificationsService.sendRegistrationWelcome.mockResolvedValue();
  });

  it('creates the user, stores avatarUrl, and sends a welcome email', async () => {
    const result = await authService.register(registrationDto);

    expect(mockedAuthRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'tester@traveloop.test',
        name: registrationDto.name,
        phoneNumber: '+919876543210',
        avatarUrl: registrationDto.avatarUrl,
        travelerProfile: registrationDto.travelerProfile
      })
    );
    expect(mockedNotificationsService.sendRegistrationWelcome).toHaveBeenCalledWith(
      prismaUser.email,
      prismaUser.name
    );
    expect(result.user.avatarUrl).toBe(prismaUser.avatarUrl);
    expect(result.user.phoneNumber).toBe(prismaUser.phoneNumber);
    expect(result.token).toEqual(expect.any(String));
  });

  it('does not fail registration when the welcome email provider fails', async () => {
    mockedNotificationsService.sendRegistrationWelcome.mockRejectedValueOnce(
      new Error('Email provider unavailable')
    );

    await expect(authService.register(registrationDto)).resolves.toMatchObject({
      user: { email: prismaUser.email }
    });
    expect(mockedAuthRepository.createUser).toHaveBeenCalledTimes(1);
  });

  it('rejects mismatched password confirmation before creating a user', async () => {
    await expect(
      authService.register({ ...registrationDto, confirmPassword: 'Password124' })
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      statusCode: 400
    } satisfies Partial<AppError>);

    expect(mockedAuthRepository.createUser).not.toHaveBeenCalled();
    expect(mockedNotificationsService.sendRegistrationWelcome).not.toHaveBeenCalled();
  });
});

describe('authService.resetPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates password and clears OTP for a valid reset request', async () => {
    const passwordHash = await bcrypt.hash('OldPassword123', 12);
    const otpHash = await bcrypt.hash('123456', 12);
    mockedAuthRepository.findByEmail.mockResolvedValueOnce({
      ...prismaUser,
      passwordHash,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 60_000)
    });
    mockedAuthRepository.updatePasswordAndClearOtp.mockResolvedValueOnce(prismaUser);

    await expect(
      authService.resetPassword({
        email: prismaUser.email,
        otp: '123456',
        newPassword: 'NewPassword123'
      })
    ).resolves.toBeUndefined();

    expect(mockedAuthRepository.updatePasswordAndClearOtp).toHaveBeenCalledWith(
      prismaUser.id,
      expect.any(String)
    );
  });

  it('rejects expired, invalid, and reused current passwords', async () => {
    mockedAuthRepository.findByEmail.mockResolvedValueOnce({
      ...prismaUser,
      otpHash: 'hash',
      otpExpiresAt: new Date(Date.now() - 60_000)
    });

    await expect(
      authService.resetPassword({
        email: prismaUser.email,
        otp: '123456',
        newPassword: 'NewPassword123'
      })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });

    const currentPasswordHash = await bcrypt.hash('Password123', 12);
    const otpHash = await bcrypt.hash('123456', 12);
    mockedAuthRepository.findByEmail.mockResolvedValueOnce({
      ...prismaUser,
      passwordHash: currentPasswordHash,
      otpHash,
      otpExpiresAt: new Date(Date.now() + 60_000)
    });

    await expect(
      authService.resetPassword({
        email: prismaUser.email,
        otp: '123456',
        newPassword: 'Password123'
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });

    expect(mockedAuthRepository.updatePasswordAndClearOtp).not.toHaveBeenCalled();
  });
});
