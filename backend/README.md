# Traveloop Backend

Node.js + Express + TypeScript + Prisma backend for Traveloop.

The API exposes `GET /health` and versioned routes under `/api/v1`.

## Stack

- Runtime: Node.js 20+
- API: Express + TypeScript
- Database: PostgreSQL via Prisma
- Auth: JWT stored in an HttpOnly cookie named `token`
- Validation: Zod
- Testing: Jest + Supertest
- Logging: Winston + Morgan

## Environment

Copy `.env.example` to `.env` and fill the values.

```powershell
cp .env.example .env
```

For Neon, `DATABASE_URL` should use SSL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
```

Required variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
JWT_SECRET="minimum-32-character-random-secret"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
PORT="3000"
LOG_LEVEL="debug"
```

Optional or feature-specific variables:

```env
GEMINI_API_KEY="..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="Traveloop <no-reply@your-domain.com>"
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_SMS_FROM="+15551234567"
TWILIO_WHATSAPP_FROM="+15551234567"
```

If `GEMINI_API_KEY` is missing or Gemini fails, AI endpoints return curated fallback data.
Email delivery uses Resend. SMS and WhatsApp delivery use Twilio-compatible messaging credentials.

Do not commit `.env`. It is already ignored by `.gitignore`.

## Local Setup

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Development server:

```powershell
npm run dev
```

Production-style local run:

```powershell
npm run build
npm start
```

The backend uses port `3000` by default:

```env
PORT="3000"
```

## Deployment Commands

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Production setup before start:

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm run build
npm start
```

## Prisma

Development migration:

```powershell
npm run prisma:migrate
```

Production migration:

```powershell
npm run prisma:deploy
```

Seed data:

```powershell
npm run prisma:seed
```

Current seed data contains 50 cities and 200 activities.

## Testing

Build check:

```powershell
npm run build
```

Automated API contract tests:

```powershell
npm test
```

Run tests serially if you want cleaner output:

```powershell
npm test -- --runInBand
```

Deployed API smoke test:

```powershell
$env:TRAVELOOP_API_URL="https://your-backend-url.example.com"
$env:TEST_ORIGIN="https://your-frontend-url.example.com"
npm run test:deployed
```

The deployed smoke test lives at `scripts/smoke-test-deployed.js`. It creates a temporary test user, logs in, creates a trip, stop, note, packing item, media record, AI requests, map route request, public share request, and then cleans up the trip data. It uses the deployed API only, so run migrations and seed data on the deployed database first.

Optional deployed smoke test variables:

```powershell
$env:TEST_EMAIL="your-test-email@example.com"
$env:TEST_PASSWORD="Password123"
$env:TEST_PHONE="+15551234567"
$env:ADMIN_JWT="paste-admin-jwt-here"
```

Set `ADMIN_JWT` only if you want the smoke test to call admin-only email/SMS/WhatsApp notification endpoints. Without it, those admin notification checks are reported as skipped.

Manual API testing:

1. Install the VS Code REST Client extension.
2. Start the backend with `npm run dev`.
3. Open `api-tests.http`.
4. Run requests from top to bottom.

Before manual API testing against Neon:

```powershell
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The manual file creates a user, logs in, stores the auth cookie in the REST Client session, then tests protected routes.

## Auth And Cookies

- JWT is stored in an HttpOnly cookie named `token`.
- Local development cookie uses `SameSite=Lax`.
- Production cookie uses `SameSite=None; Secure`.
- Frontend requests must include credentials.

Frontend example:

```ts
fetch(`${API_URL}/api/v1/auth/me`, {
  credentials: 'include'
});
```

CORS is configured with:

```ts
origin: process.env.FRONTEND_URL
credentials: true
```

State-changing requests are protected by an origin guard. Requests such as `POST`, `PUT`, and `DELETE` must come from `FRONTEND_URL`.

## API Response Format

Single resource:

```json
{
  "data": {},
  "meta": null
}
```

List resource:

```json
{
  "data": [],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

Error:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": null
}
```

Deletes return `204 No Content`.

## API Catalog

Base URL:

```text
http://localhost:3000/api/v1
```

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Health check with DB status and uptime |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | No | Create user and set auth cookie |
| `POST` | `/api/v1/auth/login` | No | Login and set auth cookie |
| `POST` | `/api/v1/auth/logout` | Yes | Clear auth cookie |
| `GET` | `/api/v1/auth/me` | Yes | Return current user |
| `POST` | `/api/v1/auth/forgot-password` | No | Generate password reset OTP |
| `POST` | `/api/v1/auth/reset-password` | No | Reset password with OTP |

Register body:

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "name": "Test User",
  "avatarUrl": "https://example.com/avatar.jpg",
  "travelerProfile": "solo"
}
```

Registration is intentionally strict: `name` must contain at least 2 characters, `avatarUrl` is required and must be a valid URL, `password` must be 8-128 characters with at least one uppercase letter, one lowercase letter, and one number, and `confirmPassword` must match `password`. After a successful registration, the backend sends a welcome email through the notification service; email delivery failures are logged but do not roll back the created account. Login accepts a valid email and an 8-128 character password.

Login body:

```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

Reset password body:

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

### Cities

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/cities` | No | List/search cities |
| `GET` | `/api/v1/cities/:id` | No | Get city with activities |

Query params:

```text
q, country, region, costIndex, page, limit
```

Example:

```text
GET /api/v1/cities?q=delhi&page=1&limit=20
```

### Activities

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/activities` | No | List/search activities |
| `GET` | `/api/v1/activities/:id` | No | Get activity detail |
| `POST` | `/api/v1/trips/:id/stops/:stopId/activities` | Yes | Assign activity to stop |
| `DELETE` | `/api/v1/trips/:id/stops/:stopId/activities/:saId` | Yes | Remove activity from stop |

Activity query params:

```text
cityId, category, maxCost, tripType, q, page, limit
```

Assign activity body:

```json
{
  "activityId": "uuid",
  "scheduledTime": "14:30",
  "actualCostUsd": 25
}
```

Only `activityId` is required.

### Trips

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/trips` | Yes | List owned trips |
| `POST` | `/api/v1/trips` | Yes | Create trip |
| `GET` | `/api/v1/trips/:id` | Yes | Get owned trip detail |
| `PUT` | `/api/v1/trips/:id` | Yes | Update owned trip |
| `DELETE` | `/api/v1/trips/:id` | Yes | Soft delete owned trip |
| `PUT` | `/api/v1/trips/:id/publish` | Yes | Publish/unpublish trip |
| `GET` | `/api/v1/trips/:id/budget` | Yes | Get budget summary |
| `GET` | `/api/v1/trips/:id/notes` | Yes | List trip notes |
| `POST` | `/api/v1/trips/:id/notes` | Yes | Create trip note |
| `PUT` | `/api/v1/trips/:id/notes/:noteId` | Yes | Update trip note |
| `DELETE` | `/api/v1/trips/:id/notes/:noteId` | Yes | Delete trip note |
| `GET` | `/api/v1/trips/:id/packing-items` | Yes | List packing items |
| `POST` | `/api/v1/trips/:id/packing-items` | Yes | Create packing item |
| `PUT` | `/api/v1/trips/:id/packing-items/:itemId` | Yes | Update packing item |
| `DELETE` | `/api/v1/trips/:id/packing-items/:itemId` | Yes | Delete packing item |
| `GET` | `/api/v1/trips/:id/media` | Yes | List media records |
| `POST` | `/api/v1/trips/:id/media` | Yes | Create media record |
| `DELETE` | `/api/v1/trips/:id/media/:mediaId` | Yes | Delete media record |

Trip list query params:

```text
status, sort, search, page, limit
```

Create trip body:

```json
{
  "title": "Rajasthan Loop",
  "description": "Optional description",
  "coverPhotoUrl": "https://example.com/photo.jpg",
  "startDate": "2026-06-01",
  "endDate": "2026-06-05",
  "tripType": "solo",
  "budgetCapUsd": 500,
  "vibe": "comfort"
}
```

Required fields:

```text
title, startDate, endDate, tripType
```

Publish body:

```json
{
  "isPublic": true
}
```

### Stops

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/trips/:id/stops` | Yes | List stops for a trip |
| `POST` | `/api/v1/trips/:id/stops` | Yes | Add stop |
| `PUT` | `/api/v1/trips/:id/stops/:stopId` | Yes | Update stop |
| `DELETE` | `/api/v1/trips/:id/stops/:stopId` | Yes | Delete stop |
| `PUT` | `/api/v1/trips/:id/stops/reorder` | Yes | Reorder stops |

Create stop body:

```json
{
  "cityId": "uuid",
  "orderIndex": 0,
  "arrivalDate": "2026-06-01",
  "departureDate": "2026-06-03",
  "notes": "Optional notes",
  "accommodationName": "Hotel name",
  "accommodationCost": 120
}
```

Required fields:

```text
cityId, orderIndex, arrivalDate, departureDate
```

Reorder body:

```json
{
  "stopOrders": [
    {
      "id": "uuid",
      "orderIndex": 0
    }
  ]
}
```

### Notes

Create note body:

```json
{
  "stopId": "optional-stop-uuid",
  "title": "Documents",
  "content": "Carry ID and booking confirmations",
  "noteType": "general",
  "isImportant": true
}
```

### Packing

Create packing item body:

```json
{
  "name": "Power bank",
  "category": "electronics",
  "isPacked": false
}
```

### Media

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/media/sign` | Yes | Sign Cloudinary upload |

Sign upload body:

```json
{
  "folder": "traveloop",
  "resourceType": "auto"
}
```

Create media record body:

```json
{
  "stopId": "optional-stop-uuid",
  "mediaType": "photo",
  "cloudinaryUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "cloudinaryId": "traveloop/sample",
  "caption": "Sample upload"
}
```

### Maps

The architecture uses Leaflet with OpenStreetMap instead of Google Maps so the MVP has no map billing dependency or API key requirement.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/maps/trips/:id/route` | Yes | Return Leaflet/OpenStreetMap markers and GeoJSON route data for owned trip stops |

Route response shape:

```json
{
  "data": {
    "tripId": "uuid",
    "provider": "openstreetmap",
    "tileLayerUrl": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    "markers": [
      {
        "stopId": "uuid",
        "cityId": "uuid",
        "label": "Jaipur, India",
        "orderIndex": 0,
        "coordinates": { "latitude": 26.9124, "longitude": 75.7873 }
      }
    ],
    "routeGeoJson": {
      "type": "Feature",
      "geometry": { "type": "LineString", "coordinates": [[75.7873, 26.9124]] }
    }
  },
  "meta": null
}
```

### AI

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/ai/itinerary` | Yes | Generate itinerary with Gemini/fallback |
| `POST` | `/api/v1/ai/packing` | Yes | Generate packing list with Gemini/fallback |
| `POST` | `/api/v1/ai/budget-estimate` | Yes | Generate per-day budget estimate with Gemini/fallback |

### Notifications

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/notifications/email` | Admin | Send an email |
| `POST` | `/api/v1/notifications/sms` | Admin | Send an SMS |
| `POST` | `/api/v1/notifications/whatsapp` | Admin | Send a WhatsApp message |

Notification endpoints are admin-only to prevent abuse. Password reset OTP emails are sent automatically through the notification service when `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are configured.

Email body:

```json
{
  "to": "user@example.com",
  "subject": "Trip reminder",
  "text": "Your trip starts tomorrow.",
  "html": "<p>Your trip starts tomorrow.</p>"
}
```

SMS / WhatsApp body:

```json
{
  "to": "+15551234567",
  "message": "Your Traveloop trip starts tomorrow."
}
```

### Docs

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/docs` | No | Lightweight API docs page |
| `GET` | `/api/v1/docs/openapi.json` | No | OpenAPI JSON summary |

### Public

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/public/trips/:slug` | No | Get public trip |

## Implemented Status

Implemented:

- Auth
- Trips
- Stops
- Cities
- Activities
- Public trip sharing
- Budget aggregation
- Notes
- Packing items
- Media signing and media records
- AI itinerary, packing, and budget estimate endpoints with fallback
- Leaflet/OpenStreetMap route data endpoint for trip maps
- Email, SMS, and WhatsApp notification service
- Lightweight API docs at `/api/v1/docs`
- Health response with DB status and uptime
- Cookie auth and origin guard
- Jest/Supertest route contract tests
- Manual `.http` API test file

Pending from the implementation playbook:

- Frontend screens for dashboard, itinerary builder/view, budget charts, settings, and admin analytics
- Full Swagger UI package integration, if the team requires interactive Swagger rather than lightweight docs/OpenAPI JSON
- Full real-database integration tests for every `400/401/403/404` path
- City full-text `search_vector` generated column and GIN index refinements
- Stop date conflict validation across neighboring stops
- Public slug collision retry loop
- Phase 2+ items from the architecture doc such as collaboration, offline mode, coupons/rewards, AI chatbot, PDF receipts, and network/medical/food location data

## Production Notes

- Use Neon or another hosted PostgreSQL database; do not use `localhost` in production.
- Keep `sslmode=require` in the Neon database URL.
- Run production migrations with `npm run prisma:deploy`.
- Use HTTPS in production so secure cookies work.
- Set `FRONTEND_URL` to the exact deployed frontend origin.
- Rotate secrets if they were shared publicly or committed accidentally.
