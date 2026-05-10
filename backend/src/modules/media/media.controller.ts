import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import type { CreateMediaDto, SignUploadDto } from './media.dto';
import { mediaService } from './media.service';

export class MediaController {
  public sign = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const signature = mediaService.signUpload(req.body as SignUploadDto);
      res.status(200).json({ data: signature, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const media = await mediaService.list(req.user.id, id);
      res.status(200).json({ data: media, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id } = req.params as { id: string };
      const media = await mediaService.create(req.user.id, id, req.body as CreateMediaDto);
      res.status(201).json({ data: media, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { id, mediaId } = req.params as { id: string; mediaId: string };
      await mediaService.delete(req.user.id, id, mediaId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const mediaController = new MediaController();
