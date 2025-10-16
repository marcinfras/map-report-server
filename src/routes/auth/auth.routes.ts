import express from 'express';
import { asyncHandler } from '@helpers/asyncHandler.js';
import { validate } from '@middleware/validate.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from '@schemas/authSchemas.js';
import { requireAuth } from '@middleware/auth.js';
import {
  changePassword,
  googleCallback,
  googleRedirect,
  login,
  logout,
  me,
  register,
} from './auth.controller.js';

const router = express.Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.get('/google', googleRedirect);
router.get('/google/callback', asyncHandler(googleCallback));
router.post('/logout', requireAuth, asyncHandler(logout));
router.get('/me', asyncHandler(me));
router.patch(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(changePassword)
);

export default router;
