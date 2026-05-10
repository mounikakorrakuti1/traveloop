import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { publicController } from './public.controller';
import { publicTripParamsDto } from './public.dto';

export const publicRouter = Router();

publicRouter.get('/trips/:slug', validate({ params: publicTripParamsDto }), publicController.getTrip);
