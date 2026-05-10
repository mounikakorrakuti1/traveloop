import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import { mapsService } from './maps.service';

export class MapsController {
  public tripRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      if (typeof req.params.id !== 'string') {
        throw new AppError('Trip id is required', 'VALIDATION_ERROR', 400);
      }

      const data = await mapsService.tripRoute(req.params.id, req.user.id);
      res.status(200).json({ data, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const mapsController = new MapsController();
