import { MealLog } from '../../models/MealLog.model.js';
import { FoodItem } from '../../models/Food.model.js';
import { NutritionCalculatorService } from '../../services/nutritionCalculator/calculator.service.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

export class MealService {
  /**
   * Log a new meal for authenticated user
   */
  static async logMeal(userId, data) {
    const processedItems = await Promise.all(
      data.items.map(async (item) => {
        let snapshot;

        if (item.foodItemId) {
          const food = await FoodItem.findById(item.foodItemId);
          if (food) {
            snapshot = NutritionCalculatorService.calculateItemNutrients(
              food.nutrients,
              item.portionGrams
            );
          }
        }

        // If manual nutrients passed
        if (!snapshot && item.nutrients) {
          snapshot = NutritionCalculatorService.calculateItemNutrients(
            item.nutrients,
            item.portionGrams
          );
        }

        // Fallback default snapshot
        if (!snapshot) {
          snapshot = {
            energyKcal: 0,
            proteinG: 0,
            carbohydratesG: 0,
            totalFatG: 0,
            fiberG: null,
            sugarG: null,
            sodiumMg: null,
          };
        }

        return {
          foodItemId: item.foodItemId || null,
          name: item.name,
          portionGrams: item.portionGrams,
          servingUnit: item.servingUnit || 'g',
          nutritionalSnapshot: snapshot,
        };
      })
    );

    const totals = NutritionCalculatorService.calculateMealTotals(processedItems);

    const meal = await MealLog.create({
      userId,
      mealType: data.mealType,
      localDate: data.localDate,
      time: data.time || undefined,
      items: processedItems,
      nutritionalTotals: totals,
      notes: data.notes || '',
    });

    return meal;
  }

  /**
   * Get meals for user with filters
   */
  static async getMeals(userId, { date, startDate, endDate, mealType, page = 1, limit = 50 }) {
    const filter = { userId };

    if (date) {
      filter.localDate = date;
    } else if (startDate && endDate) {
      filter.localDate = { $gte: startDate, $lte: endDate };
    }

    if (mealType) filter.mealType = mealType;

    const skip = (Math.max(1, page) - 1) * limit;

    const [meals, total] = await Promise.all([
      MealLog.find(filter)
        .sort({ localDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MealLog.countDocuments(filter),
    ]);

    return {
      meals,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get meal by ID (Enforces ownership)
   */
  static async getMealById(userId, mealId) {
    const meal = await MealLog.findById(mealId);
    if (!meal) throw new NotFoundError('Meal record not found');

    if (meal.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to view this meal record');
    }

    return meal;
  }

  /**
   * Update meal (Enforces ownership and recalculates totals)
   */
  static async updateMeal(userId, mealId, data) {
    const meal = await MealLog.findById(mealId);
    if (!meal) throw new NotFoundError('Meal record not found');

    if (meal.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to edit this meal record');
    }

    if (data.mealType) meal.mealType = data.mealType;
    if (data.localDate) meal.localDate = data.localDate;
    if (data.time) meal.time = data.time;
    if (data.notes !== undefined) meal.notes = data.notes;

    if (data.items && data.items.length > 0) {
      const processedItems = await Promise.all(
        data.items.map(async (item) => {
          let snapshot;
          if (item.foodItemId) {
            const food = await FoodItem.findById(item.foodItemId);
            if (food) {
              snapshot = NutritionCalculatorService.calculateItemNutrients(
                food.nutrients,
                item.portionGrams
              );
            }
          }
          if (!snapshot && item.nutrients) {
            snapshot = NutritionCalculatorService.calculateItemNutrients(
              item.nutrients,
              item.portionGrams
            );
          }
          if (!snapshot) {
            snapshot = {
              energyKcal: 0,
              proteinG: 0,
              carbohydratesG: 0,
              totalFatG: 0,
              fiberG: null,
              sugarG: null,
              sodiumMg: null,
            };
          }
          return {
            foodItemId: item.foodItemId || null,
            name: item.name,
            portionGrams: item.portionGrams,
            servingUnit: item.servingUnit || 'g',
            nutritionalSnapshot: snapshot,
          };
        })
      );

      meal.items = processedItems;
      meal.nutritionalTotals = NutritionCalculatorService.calculateMealTotals(processedItems);
    }

    await meal.save();
    return meal;
  }

  /**
   * Delete meal (Enforces ownership)
   */
  static async deleteMeal(userId, mealId) {
    const meal = await MealLog.findById(mealId);
    if (!meal) throw new NotFoundError('Meal record not found');

    if (meal.userId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to delete this meal record');
    }

    await MealLog.deleteOne({ _id: mealId });
    return { message: 'Meal record deleted successfully' };
  }
}
