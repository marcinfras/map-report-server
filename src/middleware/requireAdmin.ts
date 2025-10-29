import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@helpers/ApiError.js';
import { ERRORS } from '@/types/errors.js';

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session.user?.profile.role !== 'admin') {
    throw new ApiError('FORBIDDEN', ERRORS.AUTH.ADMIN_ONLY);
  }

  next();
};
