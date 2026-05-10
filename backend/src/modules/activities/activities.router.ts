import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { activitiesController } from './activities.controller';
import {
  activityIdParamsDto,
  assignActivityDto,
  assignActivityParamsDto,
  listActivitiesQueryDto,
  stopActivityParamsDto
} from './activities.dto';

export const activitiesRouter = Router();
export const stopActivitiesRouter = Router({ mergeParams: true });

activitiesRouter.get('/', validate({ query: listActivitiesQueryDto }), activitiesController.list);
activitiesRouter.get('/:id', validate({ params: activityIdParamsDto }), activitiesController.getById);

stopActivitiesRouter.post(
  '/',
  authMiddleware,
  validate({ params: assignActivityParamsDto, body: assignActivityDto }),
  activitiesController.assignToStop
);
stopActivitiesRouter.delete(
  '/:saId',
  authMiddleware,
  validate({ params: stopActivityParamsDto }),
  activitiesController.removeFromStop
);
