/* eslint-disable no-console */

const baseUrl = (
  process.env.TRAVELOOP_API_URL ||
  process.env.DEPLOYED_API_URL ||
  process.env.API_BASE_URL ||
  ''
).replace(/\/$/, '');

const origin = process.env.TEST_ORIGIN || '';
const timestamp = Date.now();
const testEmail = process.env.TEST_EMAIL || `koushikthummu@gmail.com`;
const testPassword = process.env.TEST_PASSWORD || 'Password123';
const testPhone = process.env.TEST_PHONE || '+917780753835';
const adminToken = process.env.ADMIN_JWT || '';

if (!baseUrl) {
  console.error('Missing TRAVELOOP_API_URL. Example: TRAVELOOP_API_URL=https://api.example.com npm run test:deployed');
  process.exit(1);
}

const state = {
  cookies: new Map(),
  cityId: null,
  activityId: null,
  tripId: null,
  stopId: null,
  assignedActivityId: null,
  noteId: null,
  packingItemId: null,
  mediaId: null,
  publicSlug: null
};

const results = [];

const cookieHeader = () =>
  [...state.cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ');

const storeCookies = (response) => {
  const setCookie = response.headers.get('set-cookie');
  if (!setCookie) return;

  for (const part of setCookie.split(/,(?=\s*[^;,\s]+=)/)) {
    const [pair] = part.trim().split(';');
    const eq = pair.indexOf('=');
    if (eq > 0) state.cookies.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
};

const request = async (label, method, path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const shouldSendOrigin = !['GET', 'HEAD', 'OPTIONS'].includes(method);
  if (shouldSendOrigin && origin) headers.Origin = origin;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const cookies = [];
  const jar = cookieHeader();
  if (options.admin && adminToken) {
    cookies.push(`token=${adminToken}`);
  } else if (jar) {
    cookies.push(jar);
  }
  if (cookies.length > 0) headers.Cookie = cookies.join('; ');

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  storeCookies(response);

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  const expected = options.expected || [200];
  const ok = expected.includes(response.status);
  results.push({ label, ok, status: response.status, expected: expected.join('|') });

  if (!ok && !options.allowFailure) {
    const details = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    throw new Error(`${label} failed: expected ${expected.join(' or ')}, got ${response.status}\n${details}`);
  }

  return { response, payload, ok };
};

const skip = (label, reason) => {
  results.push({ label, ok: true, status: 'SKIP', expected: reason });
};

const data = (payload) => payload && typeof payload === 'object' ? payload.data : null;

const main = async () => {
  console.log(`Running Traveloop deployed smoke test against ${baseUrl}`);
  console.log(origin ? `Origin header for write requests: ${origin}` : 'Origin header disabled for backend-only smoke test');
  console.log(`Test email: ${testEmail}`);

  await request('health', 'GET', '/health');

  await request('register', 'POST', '/api/v1/auth/register', {
    expected: [201, 409],
    body: {
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      name: 'Smoke Traveler',
      avatarUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      travelerProfile: 'solo'
    }
  });

  await request('login', 'POST', '/api/v1/auth/login', {
    body: { email: testEmail, password: testPassword }
  });
  await request('me', 'GET', '/api/v1/auth/me');
  skip('forgot-password', 'email delivery intentionally skipped');

  const cities = await request('cities list', 'GET', '/api/v1/cities?page=1&limit=20');
  const firstCity = data(cities.payload)?.[0];
  if (!firstCity?.id) throw new Error('No cities returned. Run seed data on the deployed database first.');
  state.cityId = firstCity.id;

  await request('city detail', 'GET', `/api/v1/cities/${state.cityId}`);

  const activities = await request(
    'activities list',
    'GET',
    `/api/v1/activities?cityId=${state.cityId}&page=1&limit=20`
  );
  const firstActivity = data(activities.payload)?.[0];
  if (firstActivity?.id) {
    state.activityId = firstActivity.id;
    await request('activity detail', 'GET', `/api/v1/activities/${state.activityId}`);
  } else {
    skip('activity detail', 'no seeded activity returned for selected city');
  }

  const trip = await request('create trip', 'POST', '/api/v1/trips', {
    expected: [201],
    body: {
      title: `Smoke Test Trip ${timestamp}`,
      startDate: '2026-06-01',
      endDate: '2026-06-05',
      tripType: 'solo',
      budgetCapUsd: 500,
      vibe: 'comfort'
    }
  });
  state.tripId = data(trip.payload)?.id;

  await request('trips list', 'GET', '/api/v1/trips?page=1&limit=20');
  await request('trip detail', 'GET', `/api/v1/trips/${state.tripId}`);
  await request('update trip', 'PUT', `/api/v1/trips/${state.tripId}`, {
    body: { title: `Updated Smoke Test Trip ${timestamp}` }
  });

  const stop = await request('add stop', 'POST', `/api/v1/trips/${state.tripId}/stops`, {
    expected: [201],
    body: {
      cityId: state.cityId,
      orderIndex: 0,
      arrivalDate: '2026-06-01',
      departureDate: '2026-06-03'
    }
  });
  state.stopId = data(stop.payload)?.id;

  await request('stops list', 'GET', `/api/v1/trips/${state.tripId}/stops`);
  await request('trip map route', 'GET', `/api/v1/maps/trips/${state.tripId}/route`);
  await request('update stop', 'PUT', `/api/v1/trips/${state.tripId}/stops/${state.stopId}`, {
    body: { notes: 'Updated by deployed smoke test' }
  });
  await request('reorder stops', 'PUT', `/api/v1/trips/${state.tripId}/stops/reorder`, {
    body: { stopOrders: [{ id: state.stopId, orderIndex: 0 }] }
  });

  if (state.activityId) {
    const assigned = await request(
      'assign activity to stop',
      'POST',
      `/api/v1/trips/${state.tripId}/stops/${state.stopId}/activities`,
      { expected: [201], body: { activityId: state.activityId } }
    );
    state.assignedActivityId = data(assigned.payload)?.id;
  } else {
    skip('assign activity to stop', 'no seeded activity returned for selected city');
  }

  await request('trip budget', 'GET', `/api/v1/trips/${state.tripId}/budget`);

  const note = await request('create note', 'POST', `/api/v1/trips/${state.tripId}/notes`, {
    expected: [201],
    body: {
      title: 'Smoke note',
      content: 'Created by deployed smoke test',
      noteType: 'general',
      isImportant: true
    }
  });
  state.noteId = data(note.payload)?.id;
  await request('notes list', 'GET', `/api/v1/trips/${state.tripId}/notes`);
  await request('update note', 'PUT', `/api/v1/trips/${state.tripId}/notes/${state.noteId}`, {
    body: { content: 'Updated by deployed smoke test' }
  });

  const packing = await request('create packing item', 'POST', `/api/v1/trips/${state.tripId}/packing-items`, {
    expected: [201],
    body: { name: 'Power bank', category: 'electronics' }
  });
  state.packingItemId = data(packing.payload)?.id;
  await request('packing list', 'GET', `/api/v1/trips/${state.tripId}/packing-items`);
  await request('update packing item', 'PUT', `/api/v1/trips/${state.tripId}/packing-items/${state.packingItemId}`, {
    body: { isPacked: true }
  });

  await request('sign cloudinary upload', 'POST', '/api/v1/media/sign', {
    body: { folder: 'traveloop', resourceType: 'auto' }
  });

  const media = await request('create media record', 'POST', `/api/v1/trips/${state.tripId}/media`, {
    expected: [201],
    body: {
      mediaType: 'photo',
      cloudinaryUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      cloudinaryId: `traveloop/smoke-${timestamp}`,
      caption: 'Smoke test upload'
    }
  });
  state.mediaId = data(media.payload)?.id;
  await request('media list', 'GET', `/api/v1/trips/${state.tripId}/media`);

  await request('ai itinerary', 'POST', '/api/v1/ai/itinerary', {
    body: { prompt: 'Rajasthan heritage trip', days: 3, vibe: 'comfort', tripType: 'solo' }
  });
  await request('ai packing', 'POST', '/api/v1/ai/packing', {
    body: { destination: firstCity.name || 'Jaipur', days: 3, tripType: 'solo', season: 'winter' }
  });
  await request('ai budget estimate', 'POST', '/api/v1/ai/budget-estimate', {
    body: { cityId: state.cityId, cityName: firstCity.name || 'Delhi', vibe: 'comfort' }
  });

  await request('docs openapi', 'GET', '/api/v1/docs/openapi.json');

  if (adminToken) {
    skip('admin email notification', 'email delivery intentionally skipped');
    await request('admin sms notification', 'POST', '/api/v1/notifications/sms', {
      admin: true,
      body: { to: testPhone, message: 'Traveloop SMS smoke test.' }
    });
    await request('admin whatsapp notification', 'POST', '/api/v1/notifications/whatsapp', {
      admin: true,
      body: { to: testPhone, message: 'Traveloop WhatsApp smoke test.' }
    });
  } else {
    skip('admin email notification', 'set ADMIN_JWT to test admin-only endpoint');
    skip('admin sms notification', 'set ADMIN_JWT to test admin-only endpoint');
    skip('admin whatsapp notification', 'set ADMIN_JWT to test admin-only endpoint');
  }

  const published = await request('publish trip', 'PUT', `/api/v1/trips/${state.tripId}/publish`, {
    body: { isPublic: true }
  });
  state.publicSlug = data(published.payload)?.publicSlug;
  await request('public trip', 'GET', `/api/v1/public/trips/${state.publicSlug}`);
};

const cleanup = async () => {
  const cleanupSteps = [
    ['remove activity from stop', 'DELETE', () => state.assignedActivityId && `/api/v1/trips/${state.tripId}/stops/${state.stopId}/activities/${state.assignedActivityId}`],
    ['delete media', 'DELETE', () => state.mediaId && `/api/v1/trips/${state.tripId}/media/${state.mediaId}`],
    ['delete packing item', 'DELETE', () => state.packingItemId && `/api/v1/trips/${state.tripId}/packing-items/${state.packingItemId}`],
    ['delete note', 'DELETE', () => state.noteId && `/api/v1/trips/${state.tripId}/notes/${state.noteId}`],
    ['delete stop', 'DELETE', () => state.stopId && `/api/v1/trips/${state.tripId}/stops/${state.stopId}`],
    ['delete trip', 'DELETE', () => state.tripId && `/api/v1/trips/${state.tripId}`],
    ['logout', 'POST', () => '/api/v1/auth/logout']
  ];

  for (const [label, method, pathFactory] of cleanupSteps) {
    const path = pathFactory();
    if (!path) continue;
    try {
      await request(label, method, path, { expected: [200, 204, 401], allowFailure: true });
    } catch (error) {
      results.push({ label, ok: false, status: 'ERR', expected: error.message });
    }
  }
};

const printSummary = () => {
  console.log('\nSmoke test summary');
  for (const result of results) {
    const mark = result.ok ? 'PASS' : 'FAIL';
    console.log(`${mark.padEnd(4)} ${String(result.status).padEnd(4)} ${result.label}`);
  }

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} step(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log('\nAll smoke test steps passed or were explicitly skipped.');
  }
};

main()
  .catch((error) => {
    console.error(`\nSmoke test stopped: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    printSummary();
  });
