import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { citiesController } from './cities.controller';
import { cityIdParamsDto, listCitiesQueryDto } from './cities.dto';

export const citiesRouter = Router();

citiesRouter.get('/', validate({ query: listCitiesQueryDto }), citiesController.list);
citiesRouter.get('/:id', validate({ params: cityIdParamsDto }), citiesController.getById);
