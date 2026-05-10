import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError } from './error-handler';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const allowedOrigin = new URL(env.FRONTEND_URL).origin;

const requestOrigin = (req: Request): string | null => {
  const origin = req.get('origin');
  if (origin) {
    return origin;
  }

  const referer = req.get('referer');
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
};

export const originGuard = (req: Request, _res: Response, next: NextFunction): void => {
  if (safeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = requestOrigin(req);
  if (origin === allowedOrigin || (env.NODE_ENV !== 'production' && origin === null)) {
    next();
    return;
  }

  next(new AppError('Request origin is not allowed', 'FORBIDDEN_ORIGIN', 403));
};
