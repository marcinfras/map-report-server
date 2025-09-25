import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { handleUploadError, upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import { createPinSchema } from '../../schemas/pinSchemas.js';
import { asyncHandler } from '../../helpers/asyncHandler.js';
import {
  createPin,
  getPinById,
  getPinCounts,
  getPins,
} from './pins.controller.js';
import { convertIdMiddleware } from '../../middleware/convertId.js';

const router = express.Router();

router.post(
  '/',
  requireAuth,
  upload.single('image'),
  handleUploadError,
  validate(createPinSchema),
  asyncHandler(createPin)
);
router.get('/', convertIdMiddleware(), asyncHandler(getPins));
router.get('/stats', asyncHandler(getPinCounts));
router.get('/:id', asyncHandler(getPinById));

export default router;
