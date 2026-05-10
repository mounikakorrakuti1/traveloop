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
apiRouter.use('/activities', activitiesRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/maps', mapsRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/notifications', notificationsRouter);
apiRouter.use('/docs', docsRouter);
apiRouter.use('/public', publicRouter);

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
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
