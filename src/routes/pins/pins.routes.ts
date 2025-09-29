import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { handleUploadError, upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import { createPinSchema, updatePinSchema } from '../../schemas/pinSchemas.js';
import { asyncHandler } from '../../helpers/asyncHandler.js';
import {
  createPin,
  deletePin,
  getPinById,
  getPinCounts,
  getPins,
  updatePin,
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
router.get('/:id', convertIdMiddleware(), asyncHandler(getPinById));
router.put(
  '/:id',
  requireAuth,
  upload.single('image'),
  handleUploadError,
  validate(updatePinSchema),
  asyncHandler(updatePin)
);
router.delete('/:id', requireAuth, asyncHandler(deletePin));

export default router;
