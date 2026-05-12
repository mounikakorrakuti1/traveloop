import type { NextFunction, Request, Response } from 'express';
import type { BudgetEstimateDto, ItineraryDto, PackingSuggestionDto } from './ai.dto';
import { aiService } from './ai.service';

export class AiController {
  public itinerary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const itinerary = await aiService.itinerary(req.user?.id ?? '', req.body as ItineraryDto);
      res.status(200).json({ data: itinerary, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public tripPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const itinerary = await aiService.tripPlan(req.user?.id ?? '', req.body as ItineraryDto);
      res.status(200).json({ data: itinerary, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public packing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const packing = await aiService.packing(req.user?.id ?? '', req.body as PackingSuggestionDto);
      res.status(200).json({ data: packing, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public budget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const budget = await aiService.budget(req.user?.id ?? '', req.body as BudgetEstimateDto);
      res.status(200).json({ data: budget, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AiController();
