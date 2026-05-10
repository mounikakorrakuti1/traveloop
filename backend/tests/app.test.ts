import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/server';
import { env } from '../src/config/env';
import { authService } from '../src/modules/auth/auth.service';

const testUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'tester@traveloop.test',
  name: 'Test Traveler',
  phoneNumber: '+919876543210',
  avatarUrl: null,
  travelerProfile: 'solo' as const,
  isAdmin: false,
  createdAt: '2026-05-10T00:00:00.000Z'
};

jest.mock('../src/modules/auth/auth.service', () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn()
  }
}));

jest.mock('../src/modules/notifications/notifications.service', () => ({
  notificationsService: {
    sendEmail: jest.fn(),
    sendSms: jest.fn(),
    sendWhatsApp: jest.fn(),
    sendRegistrationWelcome: jest.fn(),
    sendPasswordResetOtp: jest.fn()
  }
}));

jest.mock('../src/config/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }])
  }
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('Traveloop API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the health response contract', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toMatchObject({
      data: { status: 'ok', database: 'ok' },
      meta: null
    });
    expect(response.body.data.uptimeSeconds).toEqual(expect.any(Number));
  });

  it('sets the JWT in an HttpOnly cookie on login', async () => {
    mockAuthService.login.mockResolvedValueOnce({
      user: testUser,
      token: 'signed.jwt.token'
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'password123' })
      .expect(200);

    expect(response.body).toEqual({
      data: { user: testUser },
      meta: null
    });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('token=signed.jwt.token'),
        expect.stringContaining('HttpOnly'),
        expect.stringContaining('SameSite=Lax')
      ])
    );
  });

  it('authenticates protected routes from the JWT cookie', async () => {
    mockAuthService.me.mockResolvedValueOnce(testUser);
    const token = jwt.sign(
      {
        sub: testUser.id,
        email: testUser.email,
        role: 'user',
        isAdmin: false
      },
      env.JWT_SECRET
    );

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`token=${token}`])
      .expect(200);

    expect(response.body).toEqual({
      data: { user: testUser },
      meta: null
    });
    expect(mockAuthService.me).toHaveBeenCalledWith(testUser.id);
  });

  it('blocks state-changing requests from an untrusted origin', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', 'https://evil.example')
      .send({ email: testUser.email, password: 'password123' })
      .expect(403);

    expect(response.body).toEqual({
      error: 'Request origin is not allowed',
      code: 'FORBIDDEN_ORIGIN',
      details: null
    });
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });
});
