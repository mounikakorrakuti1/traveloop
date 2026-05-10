import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import { stopsService } from './stops.service';
import type { CreateStopDto, ReorderStopsDto, UpdateStopDto } from './stops.dto';

export class StopsController {
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const stops = await stopsService.list(req.user.id, id);
      res.status(200).json({ data: stops, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const stop = await stopsService.create(req.user.id, id, req.body as CreateStopDto);
      res.status(201).json({ data: stop, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id, stopId } = req.params as { id: string; stopId: string };
      const stop = await stopsService.update(req.user.id, id, stopId, req.body as UpdateStopDto);
      res.status(200).json({ data: stop, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id, stopId } = req.params as { id: string; stopId: string };
      await stopsService.delete(req.user.id, id, stopId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  public reorder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const stops = await stopsService.reorder(req.user.id, id, req.body as ReorderStopsDto);
      res.status(200).json({ data: stops, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const stopsController = new StopsController();
