import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import type { CreatePackingItemDto, UpdatePackingItemDto } from './packing.dto';
import { packingService } from './packing.service';

export class PackingController {
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const items = await packingService.list(req.user.id, id);
      res.status(200).json({ data: items, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const item = await packingService.create(req.user.id, id, req.body as CreatePackingItemDto);
      res.status(201).json({ data: item, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id, itemId } = req.params as { id: string; itemId: string };
      const item = await packingService.update(req.user.id, id, itemId, req.body as UpdatePackingItemDto);
      res.status(200).json({ data: item, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id, itemId } = req.params as { id: string; itemId: string };
      await packingService.delete(req.user.id, id, itemId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const packingController = new PackingController();
