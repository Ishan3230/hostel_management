import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async controller function to catch any errors and pass them to the next middleware.
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Global error handling middleware.
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('--- Global Error Handler ---');
  console.error('Time:', new Date().toISOString());
  console.error('Path:', req.path);
  console.error('Error:', err);
  console.error('---------------------------');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
