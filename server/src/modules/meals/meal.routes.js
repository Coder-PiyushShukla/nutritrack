import { Router } from 'express';
import { MealService } from './meal.service.js';
import { authenticateUser } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validate.js';
import { logMealSchema, updateMealSchema } from './meal.validation.js';
import { sendSuccess } from '../../utils/response.js';
import { broadcastMealLogged } from '../../services/socket/socket.service.js';

export class MealController {
  static async logMeal(req, res, next) {
    try {
      const meal = await MealService.logMeal(req.user._id, req.body);
      
      // Real-Time Notification: Broadcast meal activity to active nutritionists via Socket.IO
      broadcastMealLogged({
        mealId: meal._id,
        userName: req.user.name || 'Client',
        userId: req.user._id,
        mealType: meal.mealType,
        itemsCount: meal.items?.length || 1,
        totalCalories: meal.totalNutrients?.calories || 0,
        loggedAt: meal.loggedAt || new Date().toISOString(),
      });

      return sendSuccess(res, meal, 'Meal logged successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { date, startDate, endDate, mealType, page, limit } = req.query;
      const result = await MealService.getMeals(req.user._id, {
        date,
        startDate,
        endDate,
        mealType,
        page,
        limit,
      });
      return sendSuccess(res, result.meals, 'Meals retrieved', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const meal = await MealService.getMealById(req.user._id, req.params.id);
      return sendSuccess(res, meal, 'Meal retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const meal = await MealService.updateMeal(req.user._id, req.params.id, req.body);
      return sendSuccess(res, meal, 'Meal updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await MealService.deleteMeal(req.user._id, req.params.id);
      return sendSuccess(res, {}, result.message, 200);
    } catch (err) {
      next(err);
    }
  }
}

const router = Router();
router.use(authenticateUser);

router.post('/', validateRequest(logMealSchema), MealController.logMeal);
router.get('/', MealController.list);
router.get('/:id', MealController.getById);
router.put('/:id', validateRequest(updateMealSchema), MealController.update);
router.delete('/:id', MealController.delete);

export default router;
