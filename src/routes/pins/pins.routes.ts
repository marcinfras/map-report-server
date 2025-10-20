import express from 'express';
import {
  createPin,
  deletePin,
  getAdminPins,
  getMyPins,
  getPinById,
  getPinCounts,
  getPins,
  updatePin,
} from './pins.controller.js';
import { requireAuth } from '@middleware/auth.js';
import { handleUploadError, upload } from '@middleware/upload.js';
import { validate } from '@middleware/validate.js';
import {
  createPinSchema,
  pinFiltersSchema,
  updatePinSchema,
} from '@schemas/pinSchemas.js';
import { asyncHandler } from '@helpers/asyncHandler.js';
import { convertIdMiddleware } from '@middleware/convertId.js';
import { requireAdmin } from '@middleware/requireAdmin.js';

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
router.get(
  '/my',
  requireAuth,
  validate(pinFiltersSchema),
  convertIdMiddleware(),
  asyncHandler(getMyPins)
);
router.get(
  '/admin',
  requireAuth,
  requireAdmin,
  validate(pinFiltersSchema),
  convertIdMiddleware(),
  asyncHandler(getAdminPins)
);
router.get('/:id', convertIdMiddleware(), asyncHandler(getPinById));
router.put(
  '/:id',
  requireAuth,
  upload.single('image'),
  handleUploadError,
  validate(updatePinSchema),
  convertIdMiddleware(),
  asyncHandler(updatePin)
);
router.delete(
  '/:id',
  requireAuth,
  convertIdMiddleware(),
  asyncHandler(deletePin)
);

export default router;
