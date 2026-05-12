import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { communityController } from './community.controller';
import {
  addCommunityCommentDto,
  createCommunityPostDto,
  listCommunityQueryDto,
  placeChatQueryDto,
  sendPlaceChatMessageDto,
  postIdParamsDto
} from './community.dto';

export const communityRouter = Router();

communityRouter.get('/', validate({ query: listCommunityQueryDto }), communityController.list);
communityRouter.get('/similar-travelers', authMiddleware, communityController.similarTravelers);
communityRouter.get(
  '/place-chat',
  optionalAuthMiddleware,
  validate({ query: placeChatQueryDto }),
  communityController.listPlaceMessages
);
communityRouter.post(
  '/place-chat',
  authMiddleware,
  validate({ body: sendPlaceChatMessageDto }),
  communityController.sendPlaceMessage
);
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
