import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authenticateUser } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  updateProfileSchema,
  updatePreferencesSchema,
  updateGoalsSchema,
} from './user.validation.js';

const router = Router();

// All user routes require authenticated session
router.use(authenticateUser);

router.get('/me', UserController.getMe);
router.put('/me/profile', validateRequest(updateProfileSchema), UserController.updateProfile);
router.put('/me/preferences', validateRequest(updatePreferencesSchema), UserController.updatePreferences);
router.put('/me/goals', validateRequest(updateGoalsSchema), UserController.updateGoals);
router.get('/me/dashboard', UserController.getDashboard);
router.delete('/me/account', UserController.deleteAccount);

export default router;
