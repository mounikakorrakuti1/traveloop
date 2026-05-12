import type { NextFunction, Request, Response } from 'express';
import { destinationsService } from './destinations.service';
import type { NearbyQueryDto, TransportSearchQueryDto } from './destinations.dto';

export class DestinationsController {
  public trending = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = await destinationsService.trending();
      res.status(200).json({ data: payload, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public byName = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name } = req.params as { name: string };
      const payload = await destinationsService.getByName(name);
      res.status(200).json({ data: payload, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public nearby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = await destinationsService.nearby(req.query as unknown as NearbyQueryDto);
      res.status(200).json({ data: payload, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public weather = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { city } = req.params as { city: string };
      const payload = await destinationsService.weather(city);
      res.status(200).json({ data: payload, meta: null });
    } catch (error) {
      next(error);
    }
  };

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
