import type { NextFunction, Request, Response } from 'express';
import { citiesService } from './cities.service';
import type { ListCitiesQueryDto } from './cities.dto';

export class CitiesController {
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await citiesService.list(req.query as unknown as ListCitiesQueryDto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const city = await citiesService.getById(id);
      res.status(200).json({ data: city, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const citiesController = new CitiesController();
