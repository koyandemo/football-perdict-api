import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational: boolean = true,
    public readonly details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Error handling middleware
 * Following SOLID principles:
 * - Single Responsibility Principle: Only handles errors
 * - Open/Closed Principle: Can be extended with custom error types
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error caught by middleware:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  let details: any = undefined;

  // Handle known error types
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.errors || err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.code === 'PGRST204') {
    // Supabase schema cache error
    statusCode = 500;
    message = 'Schema cache error. Please restart the API server.';
  } else if (err.code === 'PGRST205') {
    // Supabase table not found error
    statusCode = 500;
    message = 'Table not found in schema cache. Please restart the API server.';
  } else {
    // Unknown error
    message = err.message || message;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Async error wrapper to catch async errors in express routes
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};