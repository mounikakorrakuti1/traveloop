import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { createPackingItemDto, packingParamsDto, updatePackingItemDto } from './packing.dto';
import { packingController } from './packing.controller';

export const packingRouter = Router({ mergeParams: true });

packingRouter.get('/', validate({ params: packingParamsDto }), packingController.list);
packingRouter.post(
  '/',
  validate({ params: packingParamsDto, body: createPackingItemDto }),
  packingController.create
);
packingRouter.put(
  '/:itemId',
  validate({ params: packingParamsDto, body: updatePackingItemDto }),
  packingController.update
);
packingRouter.delete('/:itemId', validate({ params: packingParamsDto }), packingController.delete);
