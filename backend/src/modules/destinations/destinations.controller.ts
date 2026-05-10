import type { NextFunction, Request, Response } from 'express';
import { destinationsService } from './destinations.service';
import type { TransportSearchQueryDto } from './destinations.dto';

export class DestinationsController {
  public intelligence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cityId } = req.params as { cityId: string };
      const payload = await destinationsService.getIntelligence(cityId);
      res.status(200).json({ data: payload, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public transportSearch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = await destinationsService.searchTransport(req.query as unknown as TransportSearchQueryDto);
      res.status(200).json({ data: payload, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const destinationsController = new DestinationsController();
