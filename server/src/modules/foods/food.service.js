import { FoodItem, FoodCategory } from '../../models/Food.model.js';
import { NotFoundError } from '../../utils/errors.js';

export class FoodService {
  static async searchFoods({ query = '', category = '', page = 1, limit = 20 }) {
    const filter = { verificationStatus: 'VERIFIED' };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (query && query.trim() !== '') {
      filter.$text = { $search: query.trim() };
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [foods, total] = await Promise.all([
      FoodItem.find(filter)
        .populate('categoryId', 'name slug')
        .sort(query ? { score: { $meta: 'textScore' } } : { name: 1 })
        .skip(skip)
        .limit(limit),
      FoodItem.countDocuments(filter),
    ]);

    return {
      foods,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getFoodById(id) {
    const food = await FoodItem.findById(id).populate('categoryId', 'name slug');
    if (!food || food.verificationStatus !== 'VERIFIED') {
      throw new NotFoundError('Food item not found or not verified');
    }
    return food;
  }

  static async getCategories() {
    return FoodCategory.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
  }
}
