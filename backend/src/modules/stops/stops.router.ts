import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { createStopDto, reorderStopsDto, tripStopParamsDto, updateStopDto } from './stops.dto';
import { stopsController } from './stops.controller';

export const stopsRouter = Router({ mergeParams: true });

stopsRouter.get('/', validate({ params: tripStopParamsDto }), stopsController.list);
stopsRouter.post('/', validate({ params: tripStopParamsDto, body: createStopDto }), stopsController.create);
stopsRouter.put(
  '/reorder',
  validate({ params: tripStopParamsDto, body: reorderStopsDto }),
  stopsController.reorder
);
stopsRouter.put(
  '/:stopId',
  validate({ params: tripStopParamsDto, body: updateStopDto }),
  stopsController.update
);
stopsRouter.delete('/:stopId', validate({ params: tripStopParamsDto }), stopsController.delete);
