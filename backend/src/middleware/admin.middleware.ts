import type { NextFunction, Request, Response } from 'express';
import { AppError } from './error-handler';

export const adminMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user?.isAdmin) {
    next(new AppError('Admin access required', 'FORBIDDEN', 403));
    return;
  }

  next();
};
