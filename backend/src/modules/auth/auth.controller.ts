import type { CookieOptions, NextFunction, Request, Response } from 'express';
import { env } from '../../config/env';
import { AppError } from '../../middleware/error-handler';
import { authService } from './auth.service';

const AUTH_COOKIE_NAME = 'token';

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const clearAuthCookieOptions: CookieOptions = {
  httpOnly: authCookieOptions.httpOnly,
  sameSite: authCookieOptions.sameSite,
  secure: authCookieOptions.secure
};

export class AuthController {
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await authService.register(req.body);
      res
        .cookie(AUTH_COOKIE_NAME, token, authCookieOptions)
        .status(201)
        .json({ data: { user }, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await authService.login(req.body);
      res
        .cookie(AUTH_COOKIE_NAME, token, authCookieOptions)
        .status(200)
        .json({ data: { user }, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public logout = (_req: Request, res: Response): void => {
    res
      .clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions)
      .status(200)
      .json({ data: { message: 'Logged out' } });
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const user = await authService.me(req.user.id);
      res.status(200).json({ data: { user }, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 'UNAUTHORIZED', 401);
      }
      const user = await authService.updateProfile(req.user.id, req.body);
      res.status(200).json({ data: { user }, meta: null });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await authService.forgotPassword(req.body);
      res.status(200).json({ data: { message: 'If the email exists, an OTP was generated' } });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await authService.resetPassword(req.body);
      res.status(200).json({ data: { message: 'Password reset successfully' } });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
