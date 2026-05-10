import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createMediaDto, mediaParamsDto, signUploadDto } from './media.dto';
import { mediaController } from './media.controller';

export const mediaRouter = Router();
export const tripMediaRouter = Router({ mergeParams: true });

mediaRouter.post('/sign', authMiddleware, validate({ body: signUploadDto }), mediaController.sign);

tripMediaRouter.get('/', validate({ params: mediaParamsDto }), mediaController.list);
tripMediaRouter.post('/', validate({ params: mediaParamsDto, body: createMediaDto }), mediaController.create);
tripMediaRouter.delete('/:mediaId', validate({ params: mediaParamsDto }), mediaController.delete);
