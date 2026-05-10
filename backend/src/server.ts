import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { activitiesRouter } from './modules/activities/activities.router';
import { aiRouter } from './modules/ai/ai.router';
import { authRouter } from './modules/auth/auth.router';
import { citiesRouter } from './modules/cities/cities.router';
import { communityRouter } from './modules/community/community.router';
import { destinationsRouter } from './modules/destinations/destinations.router';
import { docsRouter } from './modules/docs/docs.router';
import { mapsRouter } from './modules/maps/maps.router';
import { mediaRouter } from './modules/media/media.router';
import { notificationsRouter } from './modules/notifications/notifications.router';
import { publicRouter } from './modules/public/public.router';
import { tripsRouter } from './modules/trips/trips.router';
import { globalErrorHandler, notFoundHandler } from './middleware/error-handler';
import { originGuard } from './middleware/origin-guard.middleware';
import { globalRateLimiter } from './middleware/rate-limiter';
import { logger } from './utils/logger';

const apiRouter = Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/trips', tripsRouter);
apiRouter.use('/cities', citiesRouter);
apiRouter.use('/destinations', destinationsRouter);
apiRouter.use('/community', communityRouter);
apiRouter.use('/activities', activitiesRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/maps', mapsRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/docs', docsRouter);
apiRouter.use('/public', publicRouter);

const developmentOrigins =
  env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'];

const allowedOrigins = new Set([
  new URL(env.FRONTEND_URL).origin,
  ...env.CORS_ALLOWED_ORIGINS.map((origin) => new URL(origin).origin),
  ...developmentOrigins
]);

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true
    })
  );
  app.use(originGuard);
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
  app.use(globalRateLimiter);

  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        data: {
          status: 'ok',
          database: 'ok',
          uptimeSeconds: Math.floor(process.uptime())
        },
        meta: null
      });
    } catch {
      res.status(503).json({
        data: {
          status: 'degraded',
          database: 'unavailable',
          uptimeSeconds: Math.floor(process.uptime())
        },
        meta: null
      });
    }
  });
  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};

export const app = createApp();
