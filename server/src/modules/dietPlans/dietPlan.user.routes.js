import { Router } from 'express';
import { DietPlan } from '../../models/DietPlan.model.js';
import { authenticateUser } from '../../middleware/authenticate.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';

const router = Router();
router.use(authenticateUser);

// 1. Get current active published diet plan for logged-in user
router.get('/my-plan', async (req, res, next) => {
  try {
    const plan = await DietPlan.findOne({
      clientId: req.user._id,
      status: 'PUBLISHED',
    })
      .populate('nutritionistId', 'name email profile.avatar')
      .sort({ updatedAt: -1 });

    return sendSuccess(res, plan, plan ? 'Active diet plan retrieved' : 'No active diet plan assigned', 200);
  } catch (err) {
    next(err);
  }
});

// 2. Get past diet plan history
router.get('/my-plan/history', async (req, res, next) => {
  try {
    const plans = await DietPlan.find({
      clientId: req.user._id,
    })
      .populate('nutritionistId', 'name email profile.avatar')
      .sort({ createdAt: -1 });

    return sendSuccess(res, plans, 'Diet plan history retrieved', 200);
  } catch (err) {
    next(err);
  }
});

export default router;
