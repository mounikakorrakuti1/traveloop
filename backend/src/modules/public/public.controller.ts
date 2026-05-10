import type { NextFunction, Request, Response } from 'express';
import { publicService } from './public.service';

export class PublicController {
  public getTrip = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params as { slug: string };
      const trip = await publicService.getTripBySlug(slug);
      res.status(200).json({ data: trip, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const publicController = new PublicController();
