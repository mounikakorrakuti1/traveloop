import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import { tripsService } from './trips.service';
import type { CreateTripDto, ListTripsQueryDto, PublishTripDto, UpdateTripDto } from './trips.dto';

export class TripsController {
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const result = await tripsService.list(req.user.id, req.query as unknown as ListTripsQueryDto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const trip = await tripsService.create(req.user.id, req.body as CreateTripDto);
      res.status(201).json({ data: trip, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const { id } = req.params as { id: string };
      const trip = await tripsService.getById(req.user.id, id);
      res.status(200).json({ data: trip, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const { id } = req.params as { id: string };
      const trip = await tripsService.update(req.user.id, id, req.body as UpdateTripDto);
      res.status(200).json({ data: trip, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const { id } = req.params as { id: string };
      await tripsService.delete(req.user.id, id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  public publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const { id } = req.params as { id: string };
      const result = await tripsService.publish(req.user.id, id, req.body as PublishTripDto);
      res.status(200).json({ data: result, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public budget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const { id } = req.params as { id: string };
      const budget = await tripsService.budget(req.user.id, id);
      res.status(200).json({ data: budget, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const tripsController = new TripsController();
