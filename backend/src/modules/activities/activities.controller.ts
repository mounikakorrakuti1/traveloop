import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import { activitiesService } from './activities.service';
import type { AssignActivityDto, ListActivitiesQueryDto } from './activities.dto';

export class ActivitiesController {
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await activitiesService.list(req.query as unknown as ListActivitiesQueryDto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const activity = await activitiesService.getById(id);
      res.status(200).json({ data: activity, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public assignToStop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const { id, stopId } = req.params as { id: string; stopId: string };
      const stopActivity = await activitiesService.assignToStop(
        req.user.id,
        id,
        stopId,
        req.body as AssignActivityDto
      );
      res.status(201).json({ data: stopActivity, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public removeFromStop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const { id, stopId, saId } = req.params as { id: string; stopId: string; saId: string };
      await activitiesService.removeFromStop(req.user.id, id, stopId, saId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const activitiesController = new ActivitiesController();
