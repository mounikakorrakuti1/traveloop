import jwt from 'jsonwebtoken';
import request from 'supertest';
import { app } from '../src/server';
import { env } from '../src/config/env';
import { activitiesService } from '../src/modules/activities/activities.service';
import { aiService } from '../src/modules/ai/ai.service';
import { authService } from '../src/modules/auth/auth.service';
import { citiesService } from '../src/modules/cities/cities.service';
import { mapsService } from '../src/modules/maps/maps.service';
import { mediaService } from '../src/modules/media/media.service';
import { notificationsService } from '../src/modules/notifications/notifications.service';
import { notesService } from '../src/modules/notes/notes.service';
import { packingService } from '../src/modules/packing/packing.service';
import { publicService } from '../src/modules/public/public.service';
import { stopsService } from '../src/modules/stops/stops.service';
import { tripsService } from '../src/modules/trips/trips.service';

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'tester@traveloop.test',
  name: 'Test Traveler',
  phoneNumber: '+919876543210',
  avatarUrl: null,
  travelerProfile: 'solo' as const,
  isAdmin: false,
  createdAt: '2026-05-10T00:00:00.000Z'
};

const city = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Jaipur',
  state: 'Rajasthan',
  country: 'India',
  countryCode: 'IN',
  latitude: 26.9124,
  longitude: 75.7873,
  costIndex: 'medium' as const,
  areaType: 'city',
  bestSeason: 'Oct-Feb',
  isRegionalGem: false,
  thumbnailUrl: null
};

const trip = {
  id: '33333333-3333-4333-8333-333333333333',
  userId: user.id,
  title: 'Rajasthan Loop',
  description: null,
  coverPhotoUrl: null,
  startDate: '2026-06-01',
  endDate: '2026-06-05',
  tripType: 'solo' as const,
  budgetCapUsd: 500,
  vibe: 'comfort' as const,
  isPublic: false,
  publicSlug: null,
  status: 'planning' as const,
  createdAt: '2026-05-10T00:00:00.000Z',
  updatedAt: '2026-05-10T00:00:00.000Z'
};

const stop = {
  id: '44444444-4444-4444-8444-444444444444',
  tripId: trip.id,
  cityId: city.id,
  orderIndex: 0,
  arrivalDate: '2026-06-01',
  departureDate: '2026-06-03',
  notes: null,
  accommodationName: null,
  accommodationCost: null
};

const activity = {
  id: '55555555-5555-4555-8555-555555555555',
  cityId: city.id,
  name: 'Heritage walk in Jaipur',
  category: 'cultural',
  tripTypeTags: ['solo'],
  estimatedCostUsd: 18,
  durationHours: 2.5,
  description: null,
  imageUrl: null
};

const stopActivity = {
  id: '66666666-6666-4666-8666-666666666666',
  stopId: stop.id,
  activityId: activity.id,
  scheduledTime: null,
  actualCostUsd: null,
  isCompleted: false
};

const note = {
  id: '77777777-7777-4777-8777-777777777777',
  tripId: trip.id,
  stopId: null,
  title: 'Visa notes',
  content: 'Carry ID',
  noteType: 'general',
  isImportant: false,
  createdAt: '2026-05-10T00:00:00.000Z'
};

const packingItem = {
  id: '88888888-8888-4888-8888-888888888888',
  tripId: trip.id,
  name: 'Power bank',
  category: 'electronics',
  isPacked: false,
  aiSuggested: false
};

const mediaUpload = {
  id: '99999999-9999-4999-8999-999999999999',
  tripId: trip.id,
  stopId: null,
  mediaType: 'photo' as const,
  cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  cloudinaryId: 'traveloop/sample',
  caption: null,
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

jest.mock('../src/modules/cities/cities.service', () => ({
  citiesService: {
    list: jest.fn(),
    getById: jest.fn()
  }
}));

jest.mock('../src/modules/activities/activities.service', () => ({
  activitiesService: {
    list: jest.fn(),
    getById: jest.fn(),
    assignToStop: jest.fn(),
    removeFromStop: jest.fn()
  }
}));

jest.mock('../src/modules/trips/trips.service', () => ({
  tripsService: {
    list: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    publish: jest.fn(),
    budget: jest.fn()
  }
}));

jest.mock('../src/modules/stops/stops.service', () => ({
  stopsService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    reorder: jest.fn()
  }
}));

jest.mock('../src/modules/public/public.service', () => ({
  publicService: {
    getTripBySlug: jest.fn()
  }
}));

jest.mock('../src/modules/notes/notes.service', () => ({
  notesService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../src/modules/packing/packing.service', () => ({
  packingService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../src/modules/media/media.service', () => ({
  mediaService: {
    signUpload: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../src/modules/maps/maps.service', () => ({
  mapsService: {
    tripRoute: jest.fn()
  }
}));

jest.mock('../src/modules/ai/ai.service', () => ({
  aiService: {
    itinerary: jest.fn(),
    packing: jest.fn(),
    budget: jest.fn()
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

const mockedAuthService = authService as jest.Mocked<typeof authService>;
const mockedCitiesService = citiesService as jest.Mocked<typeof citiesService>;
const mockedActivitiesService = activitiesService as jest.Mocked<typeof activitiesService>;
const mockedAiService = aiService as jest.Mocked<typeof aiService>;
const mockedTripsService = tripsService as jest.Mocked<typeof tripsService>;
const mockedStopsService = stopsService as jest.Mocked<typeof stopsService>;
const mockedPublicService = publicService as jest.Mocked<typeof publicService>;
const mockedNotesService = notesService as jest.Mocked<typeof notesService>;
const mockedPackingService = packingService as jest.Mocked<typeof packingService>;
const mockedMediaService = mediaService as jest.Mocked<typeof mediaService>;
const mockedMapsService = mapsService as jest.Mocked<typeof mapsService>;
const mockedNotificationsService = notificationsService as jest.Mocked<typeof notificationsService>;

const authCookie = (): string => {
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: 'user',
      isAdmin: false
    },
    env.JWT_SECRET
  );
  return `token=${token}`;
};

const adminAuthCookie = (): string => {
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: 'admin',
      isAdmin: true
    },
    env.JWT_SECRET
  );
  return `token=${token}`;
};

describe('implemented API route contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('covers auth endpoints', async () => {
    mockedAuthService.register
      .mockResolvedValueOnce({ user, token: 'register.jwt' })
      .mockResolvedValueOnce({ user, token: 'register-no-avatar.jwt' });
    mockedAuthService.login.mockResolvedValueOnce({ user, token: 'login.jwt' });
    mockedAuthService.me.mockResolvedValueOnce(user);
    mockedAuthService.forgotPassword.mockResolvedValueOnce();
    mockedAuthService.resetPassword.mockResolvedValueOnce();

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: user.email,
        password: 'Password123',
        confirmPassword: 'Password123',
        name: user.name,
        phoneNumber: '+91 98765 43210',
        avatarUrl: 'https://example.com/avatar.jpg',
        travelerProfile: 'solo'
      })
      .expect(201);
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: user.email,
        password: 'Password123',
        confirmPassword: 'Password123',
        name: user.name,
        phoneNumber: '+91 98765 43210',
        travelerProfile: 'solo'
      })
      .expect(201);
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: user.email, password: 'password123' })
      .expect(200);
    await request(app).get('/api/v1/auth/me').set('Cookie', [authCookie()]).expect(200);
    await request(app).post('/api/v1/auth/logout').set('Cookie', [authCookie()]).expect(200);
    await request(app).post('/api/v1/auth/forgot-password').send({ email: user.email }).expect(200);
    await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ email: user.email, otp: '123456', newPassword: 'Newpass123' })
      .expect(200);
  });

  it('rejects invalid registration edge cases before auth service is called', async () => {
    const validRegistration = {
      email: user.email,
      password: 'Password123',
      confirmPassword: 'Password123',
      name: user.name,
      phoneNumber: '+919876543210',
      avatarUrl: 'https://example.com/avatar.jpg',
      travelerProfile: 'solo'
    };

    await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegistration, confirmPassword: 'Password124' })
      .expect(400)
      .expect((response) => {
        expect(response.body.details.confirmPassword).toContain('Confirm password must match password');
      });

    await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegistration, avatarUrl: 'not-a-url' })
      .expect(400)
      .expect((response) => {
        expect(response.body.details.avatarUrl).toBeDefined();
      });

    await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegistration, phoneNumber: '123' })
      .expect(400)
      .expect((response) => {
        expect(response.body.details.phoneNumber).toBeDefined();
      });

    await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validRegistration, password: 'password123', confirmPassword: 'password123' })
      .expect(400)
      .expect((response) => {
        expect(response.body.details.password).toContain('Password must include uppercase, lowercase, and number');
      });

    expect(mockedAuthService.register).not.toHaveBeenCalled();
  });

  it('covers public city and activity endpoints', async () => {
    mockedCitiesService.list.mockResolvedValueOnce({
      data: [city],
      meta: { total: 1, page: 1, limit: 20 }
    });
    mockedCitiesService.getById.mockResolvedValueOnce({ ...city, activities: [activity] });
    mockedActivitiesService.list.mockResolvedValueOnce({
      data: [activity],
      meta: { total: 1, page: 1, limit: 20 }
    });
    mockedActivitiesService.getById.mockResolvedValueOnce(activity);

    await request(app).get('/api/v1/cities?page=1&limit=20').expect(200);
    await request(app).get(`/api/v1/cities/${city.id}`).expect(200);
    await request(app).get('/api/v1/activities?page=1&limit=20').expect(200);
    await request(app).get(`/api/v1/activities/${activity.id}`).expect(200);
  });

  it('covers trip endpoints', async () => {
    mockedTripsService.list.mockResolvedValueOnce({
      data: [trip],
      meta: { total: 1, page: 1, limit: 20 }
    });
    mockedTripsService.create.mockResolvedValueOnce(trip);
    mockedTripsService.getById.mockResolvedValueOnce({ ...trip, stops: [stop] });
    mockedTripsService.update.mockResolvedValueOnce({ ...trip, title: 'Updated Trip' });
    mockedTripsService.delete.mockResolvedValueOnce();
    mockedTripsService.publish.mockResolvedValueOnce({ publicSlug: 'rajasthan-loop' });
    mockedTripsService.budget.mockResolvedValueOnce({
      tripId: trip.id,
      totalBudgetCapUsd: 500,
      totalSpentUsd: 0,
      byDay: [],
      byCategory: [],
      isOverBudget: false,
      remainingUsd: 500
    });

    await request(app).get('/api/v1/trips?page=1&limit=20').set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .post('/api/v1/trips')
      .set('Cookie', [authCookie()])
      .send({
        title: trip.title,
        startDate: trip.startDate,
        endDate: trip.endDate,
        tripType: trip.tripType,
        budgetCapUsd: trip.budgetCapUsd,
        vibe: trip.vibe
      })
      .expect(201);
    await request(app).get(`/api/v1/trips/${trip.id}`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .put(`/api/v1/trips/${trip.id}`)
      .set('Cookie', [authCookie()])
      .send({ title: 'Updated Trip' })
      .expect(200);
    await request(app).get(`/api/v1/trips/${trip.id}/budget`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .put(`/api/v1/trips/${trip.id}/publish`)
      .set('Cookie', [authCookie()])
      .send({ isPublic: true })
      .expect(200);
    await request(app).delete(`/api/v1/trips/${trip.id}`).set('Cookie', [authCookie()]).expect(204);
  });

  it('covers stop and stop activity endpoints', async () => {
    mockedStopsService.list.mockResolvedValueOnce([stop]);
    mockedStopsService.create.mockResolvedValueOnce(stop);
    mockedStopsService.update.mockResolvedValueOnce({ ...stop, notes: 'Updated' });
    mockedStopsService.reorder.mockResolvedValueOnce([stop]);
    mockedStopsService.delete.mockResolvedValueOnce();
    mockedActivitiesService.assignToStop.mockResolvedValueOnce(stopActivity);
    mockedActivitiesService.removeFromStop.mockResolvedValueOnce();

    await request(app).get(`/api/v1/trips/${trip.id}/stops`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .post(`/api/v1/trips/${trip.id}/stops`)
      .set('Cookie', [authCookie()])
      .send({
        cityId: city.id,
        orderIndex: 0,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate
      })
      .expect(201);
    await request(app)
      .put(`/api/v1/trips/${trip.id}/stops/reorder`)
      .set('Cookie', [authCookie()])
      .send({ stopOrders: [{ id: stop.id, orderIndex: 0 }] })
      .expect(200);
    await request(app)
      .put(`/api/v1/trips/${trip.id}/stops/${stop.id}`)
      .set('Cookie', [authCookie()])
      .send({ notes: 'Updated' })
      .expect(200);
    await request(app)
      .post(`/api/v1/trips/${trip.id}/stops/${stop.id}/activities`)
      .set('Cookie', [authCookie()])
      .send({ activityId: activity.id })
      .expect(201);
    await request(app)
      .delete(`/api/v1/trips/${trip.id}/stops/${stop.id}/activities/${stopActivity.id}`)
      .set('Cookie', [authCookie()])
      .expect(204);
    await request(app)
      .delete(`/api/v1/trips/${trip.id}/stops/${stop.id}`)
      .set('Cookie', [authCookie()])
      .expect(204);
  });

  it('covers public trip sharing endpoint', async () => {
    mockedPublicService.getTripBySlug.mockResolvedValueOnce({ ...trip, isPublic: true });

    await request(app).get('/api/v1/public/trips/rajasthan-loop').expect(200);
  });

  it('covers notes, packing, media, AI, and docs endpoints', async () => {
    mockedNotesService.list.mockResolvedValueOnce([note]);
    mockedNotesService.create.mockResolvedValueOnce(note);
    mockedNotesService.update.mockResolvedValueOnce({ ...note, isImportant: true });
    mockedNotesService.delete.mockResolvedValueOnce();
    mockedPackingService.list.mockResolvedValueOnce([packingItem]);
    mockedPackingService.create.mockResolvedValueOnce(packingItem);
    mockedPackingService.update.mockResolvedValueOnce({ ...packingItem, isPacked: true });
    mockedPackingService.delete.mockResolvedValueOnce();
    mockedMediaService.signUpload.mockReturnValueOnce({
      signature: 'signed',
      timestamp: 123,
      cloudName: 'demo',
      apiKey: 'key',
      folder: 'traveloop',
      resourceType: 'auto'
    });
    mockedMediaService.list.mockResolvedValueOnce([mediaUpload]);
    mockedMediaService.create.mockResolvedValueOnce(mediaUpload);
    mockedMediaService.delete.mockResolvedValueOnce();
    mockedAiService.itinerary.mockResolvedValueOnce({ stops: [] });
    mockedAiService.packing.mockResolvedValueOnce([{ category: 'electronics', items: ['Power bank'] }]);
    mockedAiService.budget.mockResolvedValueOnce({
      cityId: city.id,
      cityName: city.name,
      perDayUsd: 100,
      accommodationUsd: 50,
      foodUsd: 25,
      activitiesUsd: 25
    });
    mockedMapsService.tripRoute.mockResolvedValueOnce({
      tripId: trip.id,
      provider: 'openstreetmap',
      tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
      markers: [
        {
          stopId: stop.id,
          cityId: city.id,
          label: 'Jaipur, India',
          orderIndex: 0,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          coordinates: { latitude: city.latitude, longitude: city.longitude }
        }
      ],
      routeGeoJson: {
        type: 'Feature',
        properties: { tripId: trip.id, stopCount: 1 },
        geometry: { type: 'LineString', coordinates: [[city.longitude, city.latitude]] }
      },
      links: { openStreetMap: 'https://www.openstreetmap.org/' }
    });

    await request(app).get(`/api/v1/trips/${trip.id}/notes`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .post(`/api/v1/trips/${trip.id}/notes`)
      .set('Cookie', [authCookie()])
      .send({ title: note.title, content: note.content, noteType: note.noteType })
      .expect(201);
    await request(app)
      .put(`/api/v1/trips/${trip.id}/notes/${note.id}`)
      .set('Cookie', [authCookie()])
      .send({ isImportant: true })
      .expect(200);
    await request(app).delete(`/api/v1/trips/${trip.id}/notes/${note.id}`).set('Cookie', [authCookie()]).expect(204);
    await request(app).get(`/api/v1/trips/${trip.id}/packing-items`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .post(`/api/v1/trips/${trip.id}/packing-items`)
      .set('Cookie', [authCookie()])
      .send({ name: packingItem.name, category: packingItem.category })
      .expect(201);
    await request(app)
      .put(`/api/v1/trips/${trip.id}/packing-items/${packingItem.id}`)
      .set('Cookie', [authCookie()])
      .send({ isPacked: true })
      .expect(200);
    await request(app)
      .delete(`/api/v1/trips/${trip.id}/packing-items/${packingItem.id}`)
      .set('Cookie', [authCookie()])
      .expect(204);
    await request(app).post('/api/v1/media/sign').set('Cookie', [authCookie()]).send({}).expect(200);
    await request(app).get(`/api/v1/trips/${trip.id}/media`).set('Cookie', [authCookie()]).expect(200);
    await request(app)
      .post(`/api/v1/trips/${trip.id}/media`)
      .set('Cookie', [authCookie()])
      .send({
        mediaType: mediaUpload.mediaType,
        cloudinaryUrl: mediaUpload.cloudinaryUrl,
        cloudinaryId: mediaUpload.cloudinaryId
      })
      .expect(201);
    await request(app)
      .delete(`/api/v1/trips/${trip.id}/media/${mediaUpload.id}`)
      .set('Cookie', [authCookie()])
      .expect(204);
    await request(app)
      .post('/api/v1/ai/itinerary')
      .set('Cookie', [authCookie()])
      .send({ prompt: 'Rajasthan', days: 3, vibe: 'comfort', tripType: 'solo' })
      .expect(200);
    await request(app)
      .post('/api/v1/ai/packing')
      .set('Cookie', [authCookie()])
      .send({ destination: 'Jaipur', days: 3, tripType: 'solo' })
      .expect(200);
    await request(app)
      .post('/api/v1/ai/budget-estimate')
      .set('Cookie', [authCookie()])
      .send({ cityId: city.id, cityName: city.name, vibe: 'comfort' })
      .expect(200);
    await request(app)
      .get(`/api/v1/maps/trips/${trip.id}/route`)
      .set('Cookie', [authCookie()])
      .expect(200);
    await request(app).get('/api/v1/docs/openapi.json').expect(200);
  });

  it('covers admin notification endpoints', async () => {
    mockedNotificationsService.sendEmail.mockResolvedValueOnce({
      provider: 'resend',
      messageId: 'email_123',
      status: 'sent'
    });
    mockedNotificationsService.sendSms.mockResolvedValueOnce({
      provider: 'twilio',
      messageId: 'sms_123',
      status: 'sent'
    });
    mockedNotificationsService.sendWhatsApp.mockResolvedValueOnce({
      provider: 'twilio',
      messageId: 'wa_123',
      status: 'sent'
    });

    await request(app)
      .post('/api/v1/notifications/email')
      .set('Cookie', [adminAuthCookie()])
      .send({ to: user.email, subject: 'Hello', text: 'Test email' })
      .expect(200);
    await request(app)
      .post('/api/v1/notifications/sms')
      .set('Cookie', [adminAuthCookie()])
      .send({ to: '+15551234567', message: 'Test sms' })
      .expect(200);
    await request(app)
      .post('/api/v1/notifications/whatsapp')
      .set('Cookie', [adminAuthCookie()])
      .send({ to: '+15551234567', message: 'Test whatsapp' })
      .expect(200);
  });
});
