import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error-handler';

interface JwtPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
}

export interface RequestUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
}

const isJwtPayload = (payload: string | jwt.JwtPayload): payload is JwtPayload & jwt.JwtPayload =>
  typeof payload !== 'string' &&
  typeof payload.sub === 'string' &&
  typeof payload.email === 'string' &&
  (payload.role === 'user' || payload.role === 'admin') &&
  typeof payload.isAdmin === 'boolean';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.token;

  if (typeof token !== 'string') {
    next(new AppError('Authentication required', 'UNAUTHORIZED', 401));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (!isJwtPayload(payload)) {
      next(new AppError('Invalid authentication token', 'UNAUTHORIZED', 401));
      return;
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      isAdmin: payload.isAdmin
    };
    next();
  } catch {
    next(new AppError('Invalid authentication token', 'UNAUTHORIZED', 401));
  }
};
