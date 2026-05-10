import { Router } from 'express';
import { adminMiddleware } from '../../middleware/admin.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { notificationsController } from './notifications.controller';
import { sendEmailDto, sendPhoneMessageDto } from './notifications.dto';

export const notificationsRouter = Router();

notificationsRouter.use(authMiddleware, adminMiddleware);
notificationsRouter.post('/email', validate({ body: sendEmailDto }), notificationsController.sendEmail);
notificationsRouter.post('/sms', validate({ body: sendPhoneMessageDto }), notificationsController.sendSms);
notificationsRouter.post(
  '/whatsapp',
  validate({ body: sendPhoneMessageDto }),
  notificationsController.sendWhatsApp
);
