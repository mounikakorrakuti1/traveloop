import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { destinationsController } from './destinations.controller';
import { destinationCityParamsDto, transportSearchQueryDto } from './destinations.dto';

export const destinationsRouter = Router();

// Static paths must be registered before `/:cityId` or Express may treat "transport" as a UUID-ish param in some setups.
destinationsRouter.get(
  '/transport/search',
  validate({ query: transportSearchQueryDto }),
  destinationsController.transportSearch
);
destinationsRouter.get(
  '/:cityId/intelligence',
  validate({ params: destinationCityParamsDto }),
  destinationsController.intelligence
);
