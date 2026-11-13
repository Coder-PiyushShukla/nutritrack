import { Recipe } from '../../models/Recipe.model.js';
import { NotFoundError } from '../../utils/errors.js';

export class RecipeService {
  static async getRecipes({ category, page = 1, limit = 20 }) {
    const filter = { verificationStatus: 'PUBLISHED' };
    if (category && category !== 'all') filter.category = category;

    const skip = (Math.max(1, page) - 1) * limit;

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Recipe.countDocuments(filter),
    ]);

    return {
      recipes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getRecipeById(id) {
    const recipe = await Recipe.findById(id)
      .populate('createdBy', 'name')
      .populate('ingredients.foodItemId', 'name nutrients servingInformation');
    if (!recipe || recipe.verificationStatus !== 'PUBLISHED') {
      throw new NotFoundError('Recipe not found');
    }
    return recipe;
  }
}
