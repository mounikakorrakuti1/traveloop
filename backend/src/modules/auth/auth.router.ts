import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rate-limiter';
import { validate } from '../../middleware/validate.middleware';
import { authController } from './auth.controller';
import { forgotPasswordDto, loginDto, registerDto, resetPasswordDto } from './auth.dto';

export const authRouter = Router();

authRouter.post(
  '/register',
  authRateLimiter,
  validate({ body: registerDto }),
  authController.register
);
authRouter.post('/login', authRateLimiter, validate({ body: loginDto }), authController.login);
authRouter.post('/logout', authMiddleware, authController.logout);
authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validate({ body: forgotPasswordDto }),
  authController.forgotPassword
);
authRouter.post(
  '/reset-password',
  authRateLimiter,
  validate({ body: resetPasswordDto }),
  authController.resetPassword
);
authRouter.get('/me', authMiddleware, authController.me);
