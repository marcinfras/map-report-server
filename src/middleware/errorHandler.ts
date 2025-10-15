import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@helpers/ApiError.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
};
