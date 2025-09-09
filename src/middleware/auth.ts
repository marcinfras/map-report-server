import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../helpers/ApiError.js';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.user?._id) {
    throw new ApiError('UNAUTHORIZED', 'Authentication required');
  }
  next();
};
