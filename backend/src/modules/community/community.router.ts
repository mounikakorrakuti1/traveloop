import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { communityController } from './community.controller';
import {
  addCommunityCommentDto,
  createCommunityPostDto,
  listCommunityQueryDto,
  postIdParamsDto
} from './community.dto';

export const communityRouter = Router();

communityRouter.get('/', validate({ query: listCommunityQueryDto }), communityController.list);
communityRouter.post('/', authMiddleware, validate({ body: createCommunityPostDto }), communityController.create);
communityRouter.post(
  '/:postId/like',
  authMiddleware,
  validate({ params: postIdParamsDto }),
  communityController.toggleLike
);
communityRouter.post(
  '/:postId/bookmark',
  authMiddleware,
  validate({ params: postIdParamsDto }),
  communityController.toggleBookmark
);
communityRouter.post(
  '/:postId/comments',
  authMiddleware,
  validate({ params: postIdParamsDto, body: addCommunityCommentDto }),
  communityController.addComment
);
