import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { usersController } from './users.controller';
import {
  deleteAccountDto,
  requestDeleteAccountOtpDto,
  requestProfileVerificationOtpDto,
  verifyProfileOtpDto
} from './users.dto';

export const usersRouter = Router();

usersRouter.post(
  '/delete-account/request-otp',
  authMiddleware,
  validate({ body: requestDeleteAccountOtpDto }),
  usersController.requestDeleteAccountOtp
);

usersRouter.delete(
  '/delete-account',
  authMiddleware,
  validate({ body: deleteAccountDto }),
  usersController.deleteAccount
);

usersRouter.post(
  '/profile-verification/request-otp',
  authMiddleware,
  validate({ body: requestProfileVerificationOtpDto }),
  usersController.requestProfileVerificationOtp
);

usersRouter.post(
  '/profile-verification/verify',
  authMiddleware,
  validate({ body: verifyProfileOtpDto }),
  usersController.verifyProfileOtp
);
