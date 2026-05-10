import { prisma } from './config/prisma';
import { env } from './config/env';
import { app } from './server';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info('Traveloop API listening', { port: env.PORT, nodeEnv: env.NODE_ENV });
});

const shutdown = async (signal: string): Promise<void> => {
  logger.info('Shutdown signal received', { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason });
});
