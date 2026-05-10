import { Router } from 'express';

const openApiDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Traveloop API',
    version: '0.1.0'
  },
  paths: {
    '/health': { get: { summary: 'Health check' } },
    '/api/v1/auth/register': { post: { summary: 'Register user' } },
    '/api/v1/auth/login': { post: { summary: 'Login user' } },
    '/api/v1/auth/logout': { post: { summary: 'Logout user' } },
    '/api/v1/auth/me': { get: { summary: 'Current user' } },
    '/api/v1/trips': { get: { summary: 'List trips' }, post: { summary: 'Create trip' } },
    '/api/v1/trips/{id}': {
      get: { summary: 'Get trip' },
      put: { summary: 'Update trip' },
      delete: { summary: 'Delete trip' }
    },
    '/api/v1/trips/{id}/budget': { get: { summary: 'Trip budget summary' } },
    '/api/v1/trips/{id}/stops': { get: { summary: 'List stops' }, post: { summary: 'Create stop' } },
    '/api/v1/trips/{id}/notes': { get: { summary: 'List notes' }, post: { summary: 'Create note' } },
    '/api/v1/trips/{id}/packing-items': {
      get: { summary: 'List packing items' },
      post: { summary: 'Create packing item' }
    },
    '/api/v1/trips/{id}/media': { get: { summary: 'List media' }, post: { summary: 'Create media record' } },
    '/api/v1/cities': { get: { summary: 'List cities' } },
    '/api/v1/activities': { get: { summary: 'List activities' } },
    '/api/v1/ai/itinerary': { post: { summary: 'Generate itinerary' } },
    '/api/v1/ai/packing': { post: { summary: 'Generate packing list' } },
    '/api/v1/ai/budget-estimate': { post: { summary: 'Generate budget estimate' } },
    '/api/v1/maps/trips/{id}/route': { get: { summary: 'Get Leaflet/OpenStreetMap route data for a trip' } },
    '/api/v1/media/sign': { post: { summary: 'Sign Cloudinary upload' } },
    '/api/v1/notifications/email': { post: { summary: 'Send email notification' } },
    '/api/v1/notifications/sms': { post: { summary: 'Send SMS notification' } },
    '/api/v1/notifications/whatsapp': { post: { summary: 'Send WhatsApp notification' } },
    '/api/v1/public/trips/{slug}': { get: { summary: 'Get public trip' } }
  }
};

export const docsRouter = Router();

docsRouter.get('/openapi.json', (_req, res) => {
  res.status(200).json(openApiDocument);
});

docsRouter.get('/', (_req, res) => {
  res.status(200).type('html').send(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Traveloop API Docs</title></head>
<body>
  <h1>Traveloop API Docs</h1>
  <p>OpenAPI JSON is available at <a href="/api/v1/docs/openapi.json">/api/v1/docs/openapi.json</a>.</p>
  <pre>${JSON.stringify(openApiDocument.paths, null, 2)}</pre>
</body>
</html>`);
});
