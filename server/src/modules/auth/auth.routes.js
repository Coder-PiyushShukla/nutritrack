import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { authenticateUser } from '../../middleware/authenticate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import {
  registerUserSchema,
  applyNutritionistSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.validation.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', authLimiter, validateRequest(registerUserSchema), AuthController.register);
router.post('/apply', authLimiter, validateRequest(applyNutritionistSchema), AuthController.applyNutritionist);
router.get('/verify-email', validateRequest(verifyEmailSchema), AuthController.verifyEmail);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);

// Password Recovery
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.resetPassword);

// Authenticated Session Endpoints
router.get('/me', authenticateUser, AuthController.getMe);
router.post('/logout', authenticateUser, AuthController.logout);
router.post('/logout-all', authenticateUser, AuthController.logoutAll);
router.put('/change-password', authenticateUser, validateRequest(changePasswordSchema), AuthController.changePassword);

export default router;
