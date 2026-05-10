import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: Record<string, string[]> | null;

  public constructor(
    message: string,
    code: string,
    statusCode: number,
    details: Record<string, string[]> | null = null
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

const zodDetails = (error: ZodError): Record<string, string[]> => {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'body';
    details[key] = [...(details[key] ?? []), issue.message];
  }

  return details;
};

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError('Resource not found', 'NOT_FOUND', 404));
};

export const globalErrorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: zodDetails(error)
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      details: error.details ?? null
    });
    return;
  }

  const err = error instanceof Error ? error : new Error('Unknown error');
  logger.error('Unhandled application error', { error: err.message, stack: err.stack });

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: null
  });
};
