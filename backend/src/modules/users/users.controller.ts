import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../middleware/error-handler';
import { usersService } from './users.service';

export class UsersController {
  public requestDeleteAccountOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      await usersService.requestDeleteAccountOtp(req.user.id);
      res.status(200).json({ data: { message: 'OTP sent to your email and phone' }, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }

      await usersService.deleteAccount(req.user.id, req.body.otp as string);
      res.status(200).json({ data: { message: 'Account deleted successfully' }, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public requestProfileVerificationOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      await usersService.requestProfileVerificationOtp(req.user.id, req.body);
      res.status(200).json({ data: { message: 'Verification OTP sent' }, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public verifyProfileOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      await usersService.verifyProfileOtp(req.user.id, req.body);
      res.status(200).json({ data: { message: 'Profile contact verified' }, meta: null });
    } catch (error) {
      next(error);
    }
  };
}

export const usersController = new UsersController();
