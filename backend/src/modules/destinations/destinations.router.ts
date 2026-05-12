import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { destinationsController } from './destinations.controller';
import {
  destinationCityParamsDto,
  destinationNameParamsDto,
  nearbyQueryDto,
  transportSearchQueryDto,
  weatherCityParamsDto
} from './destinations.dto';

export const destinationsRouter = Router();
export const destinationLookupRouter = Router();
export const nearbyRouter = Router();
export const weatherRouter = Router();

// Static paths must be registered before `/:cityId` or Express may treat "transport" as a UUID-ish param in some setups.
destinationsRouter.get('/trending', destinationsController.trending);
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

destinationLookupRouter.get(
  '/:name',
  validate({ params: destinationNameParamsDto }),
  destinationsController.byName
);

nearbyRouter.get('/', validate({ query: nearbyQueryDto }), destinationsController.nearby);
weatherRouter.get(
  '/:city',
  validate({ params: weatherCityParamsDto }),
  destinationsController.weather
);
