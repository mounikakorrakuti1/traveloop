import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { tripMediaRouter } from '../media/media.router';
import { notesRouter } from '../notes/notes.router';
import { packingRouter } from '../packing/packing.router';
import { stopActivitiesRouter } from '../activities/activities.router';
import { stopsRouter } from '../stops/stops.router';
import { tripsController } from './trips.controller';
import {
  createTripDto,
  listTripsQueryDto,
  publishTripDto,
  tripIdParamsDto,
  updateTripDto
} from './trips.dto';

export const tripsRouter = Router();

tripsRouter.use(authMiddleware);
tripsRouter.get('/', validate({ query: listTripsQueryDto }), tripsController.list);
tripsRouter.post('/', validate({ body: createTripDto }), tripsController.create);
tripsRouter.get('/:id/budget', validate({ params: tripIdParamsDto }), tripsController.budget);
tripsRouter.use('/:id/media', tripMediaRouter);
tripsRouter.use('/:id/notes', notesRouter);
tripsRouter.use('/:id/packing-items', packingRouter);
tripsRouter.use('/:id/stops/:stopId/activities', stopActivitiesRouter);
tripsRouter.use('/:id/stops', stopsRouter);
tripsRouter.get('/:id', validate({ params: tripIdParamsDto }), tripsController.getById);
tripsRouter.put(
  '/:id',
  validate({ params: tripIdParamsDto, body: updateTripDto }),
  tripsController.update
);
tripsRouter.delete('/:id', validate({ params: tripIdParamsDto }), tripsController.delete);
tripsRouter.put(
  '/:id/publish',
  validate({ params: tripIdParamsDto, body: publishTripDto }),
  tripsController.publish
);
