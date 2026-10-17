import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/AppError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      error: 'Bad Request',
      message: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.statusCode === 400 ? 'Bad Request' : err.statusCode === 404 ? 'Not Found' : 'Error',
      message: err.message,
    });
    return;
  }

  // Handle unexpected errors safely
  // eslint-disable-next-line no-console
  console.error('[Unhandled Internal Error]:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred.' 
      : err.message || 'Internal Server Error',
  });
}
