import type { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import { ApiError } from '@helpers/ApiError.js';
import { ERRORS } from '@/types/errors.js';

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const handleUploadError = (
  error: Error | MulterError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError('BAD_REQUEST', ERRORS.MULTER.FILE_TOO_LARGE));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(
        new ApiError('BAD_REQUEST', ERRORS.MULTER.LIMIT_UNEXPECTED_FILE)
      );
    }
  }

  if (error && error.message === 'Only image files are allowed!') {
    return next(new ApiError('BAD_REQUEST', ERRORS.MULTER.INVALID_FILE_TYPE));
  }
  next(error);
};
