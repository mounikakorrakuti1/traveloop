import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import { communityService } from './community.service';
import type {
  AddCommunityCommentDto,
  CreateCommunityPostDto,
  ListCommunityQueryDto
} from './community.dto';

export class CommunityController {
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await communityService.list(req.query as unknown as ListCommunityQueryDto, req.user?.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const post = await communityService.create(req.user.id, req.body as CreateCommunityPostDto);
      res.status(201).json({ data: post, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public toggleLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { postId } = req.params as { postId: string };
      const post = await communityService.toggleLike(postId, req.user.id);
      res.status(200).json({ data: post, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public toggleBookmark = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { postId } = req.params as { postId: string };
      const post = await communityService.toggleBookmark(postId, req.user.id);
      res.status(200).json({ data: post, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      const { postId } = req.params as { postId: string };
      const post = await communityService.addComment(postId, req.user.id, req.body as AddCommunityCommentDto);
      res.status(200).json({ data: post, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const communityController = new CommunityController();
