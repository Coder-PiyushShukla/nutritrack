import { FoodService } from './food.service.js';
import { sendSuccess } from '../../utils/response.js';

export class FoodController {
  static async search(req, res, next) {
    try {
      const { query, category, page, limit } = req.query;
      const result = await FoodService.searchFoods({ query, category, page, limit });
      return sendSuccess(res, result.foods, 'Foods retrieved successfully', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const food = await FoodService.getFoodById(req.params.id);
      return sendSuccess(res, food, 'Food item details retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await FoodService.getCategories();
      return sendSuccess(res, categories, 'Categories retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }
}
