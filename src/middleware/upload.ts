import type { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import path from 'path';
import { ApiError } from '../helpers/ApiError.js';
import { ERRORS } from '../types/errors.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/pins');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `pin-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

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
  storage: storage,
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
