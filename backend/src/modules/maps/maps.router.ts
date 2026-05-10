import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { mapsController } from './maps.controller';

export const mapsRouter = Router();

mapsRouter.get('/trips/:id/route', authMiddleware, mapsController.tripRoute);
