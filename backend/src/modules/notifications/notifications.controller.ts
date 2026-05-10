import type { NextFunction, Request, Response } from 'express';
import type { SendEmailDto, SendPhoneMessageDto } from './notifications.dto';
import { notificationsService } from './notifications.service';

export class NotificationsController {
  public sendEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await notificationsService.sendEmail(req.body as SendEmailDto);
      res.status(200).json({ data: result, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public sendSms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await notificationsService.sendSms(req.body as SendPhoneMessageDto);
      res.status(200).json({ data: result, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public sendWhatsApp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await notificationsService.sendWhatsApp(req.body as SendPhoneMessageDto);
      res.status(200).json({ data: result, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const notificationsController = new NotificationsController();
