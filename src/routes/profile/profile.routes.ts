import express from 'express';
import { updateProfile } from './profile.controller.js';
import { requireAuth } from '@middleware/auth.js';
import { handleUploadError, upload } from '@middleware/upload.js';
import { asyncHandler } from '@helpers/asyncHandler.js';

const router = express.Router();

router.patch(
  '/',
  requireAuth,
  upload.single('avatar'),
  handleUploadError,
  asyncHandler(updateProfile)
);

export default router;
