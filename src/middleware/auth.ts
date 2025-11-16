import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '@helpers/ApiError.js';
import { User } from '@models/Users/Users.js';
import { ERRORS } from '@/types/errors.js';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.user?._id) {
    throw new ApiError('UNAUTHORIZED', 'Authentication required');
  }

  const user = await User.findById(req.session?.user?._id);

  if (!user) {
    throw new ApiError('BAD_REQUEST', ERRORS.AUTH.NOT_FOUND);
  }

  next();
};
