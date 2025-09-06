import type { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';
import { ApiError } from '../helpers/ApiError.js';

export const validate =
  (schema: yup.Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const message = error.errors.join(', ');
        return next(new ApiError('BAD_REQUEST', message));
      }
      next(new ApiError('BAD_REQUEST', 'Invalid request data'));
    }
  };
