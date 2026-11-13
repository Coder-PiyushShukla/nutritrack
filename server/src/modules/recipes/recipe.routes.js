import { Router } from 'express';
import { RecipeService } from './recipe.service.js';
import { sendSuccess } from '../../utils/response.js';

export class RecipeController {
  static async list(req, res, next) {
    try {
      const { category, page, limit } = req.query;
      const result = await RecipeService.getRecipes({ category, page, limit });
      return sendSuccess(res, result.recipes, 'Recipes retrieved', 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const recipe = await RecipeService.getRecipeById(req.params.id);
      return sendSuccess(res, recipe, 'Recipe details retrieved', 200);
    } catch (err) {
      next(err);
    }
  }
}

const router = Router();
router.get('/recipes', RecipeController.list);
router.get('/recipes/:id', RecipeController.getById);

export default router;
