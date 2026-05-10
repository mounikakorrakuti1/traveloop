import type { RequestUser } from '../middleware/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export {};
