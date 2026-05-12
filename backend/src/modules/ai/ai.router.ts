import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { aiRateLimiter } from '../../middleware/rate-limiter';
import { validate } from '../../middleware/validate.middleware';
import { aiController } from './ai.controller';
import { budgetEstimateDto, itineraryDto, packingSuggestionDto } from './ai.dto';

export const aiRouter = Router();

aiRouter.use(authMiddleware, aiRateLimiter);
aiRouter.post('/trip-plan', validate({ body: itineraryDto }), aiController.tripPlan);
aiRouter.post('/itinerary', validate({ body: itineraryDto }), aiController.itinerary);
aiRouter.post('/packing', validate({ body: packingSuggestionDto }), aiController.packing);
aiRouter.post('/budget-estimate', validate({ body: budgetEstimateDto }), aiController.budget);
