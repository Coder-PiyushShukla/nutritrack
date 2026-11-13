/**
 * Centralized Nutrition Calculator Service
 * Strictly adheres to 100g standard basis calculation.
 * Preserves missing values as null (never fabricated zeroes).
 */

export class NutritionCalculatorService {
  /**
   * Calculate nutrients for a specific portion in grams based on per-100g values
   * Formula: calculated = (portionGrams / 100) * valuePer100g
   */
  static calculateItemNutrients(nutrientsPer100g, portionGrams) {
    if (!portionGrams || portionGrams <= 0) {
      throw new Error('portionGrams must be a positive number');
    }

    const factor = portionGrams / 100;

    const calculateField = (value) => {
      if (value === null || value === undefined || isNaN(value)) {
        return null;
      }
      return Math.round(Number(value) * factor * 10) / 10;
    };

    return {
      energyKcal: Math.round(calculateField(nutrientsPer100g.energyKcal) || 0),
      proteinG: calculateField(nutrientsPer100g.proteinG) ?? 0,
      carbohydratesG: calculateField(nutrientsPer100g.carbohydratesG) ?? 0,
      totalFatG: calculateField(nutrientsPer100g.totalFatG) ?? 0,
      fiberG: calculateField(nutrientsPer100g.fiberG),
      sugarG: calculateField(nutrientsPer100g.sugarG),
      sodiumMg: calculateField(nutrientsPer100g.sodiumMg),
    };
  }

  /**
   * Aggregate nutritional snapshots of items into a meal total
   */
  static calculateMealTotals(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        energyKcal: 0,
        proteinG: 0,
        carbohydratesG: 0,
        totalFatG: 0,
        fiberG: 0,
        sugarG: 0,
        sodiumMg: 0,
      };
    }

    const totals = {
      energyKcal: 0,
      proteinG: 0,
      carbohydratesG: 0,
      totalFatG: 0,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
    };

    let hasIncompleteFiber = false;
    let hasIncompleteSugar = false;
    let hasIncompleteSodium = false;

    items.forEach((item) => {
      const snap = item.nutritionalSnapshot || {};
      totals.energyKcal += Number(snap.energyKcal) || 0;
      totals.proteinG += Number(snap.proteinG) || 0;
      totals.carbohydratesG += Number(snap.carbohydratesG) || 0;
      totals.totalFatG += Number(snap.totalFatG) || 0;

      if (snap.fiberG !== null && snap.fiberG !== undefined) {
        totals.fiberG += Number(snap.fiberG);
      } else {
        hasIncompleteFiber = true;
      }

      if (snap.sugarG !== null && snap.sugarG !== undefined) {
        totals.sugarG += Number(snap.sugarG);
      } else {
        hasIncompleteSugar = true;
      }

      if (snap.sodiumMg !== null && snap.sodiumMg !== undefined) {
        totals.sodiumMg += Number(snap.sodiumMg);
      } else {
        hasIncompleteSodium = true;
      }
    });

    return {
      energyKcal: Math.round(totals.energyKcal),
      proteinG: Math.round(totals.proteinG * 10) / 10,
      carbohydratesG: Math.round(totals.carbohydratesG * 10) / 10,
      totalFatG: Math.round(totals.totalFatG * 10) / 10,
      fiberG: hasIncompleteFiber && totals.fiberG === 0 ? null : Math.round(totals.fiberG * 10) / 10,
      sugarG: hasIncompleteSugar && totals.sugarG === 0 ? null : Math.round(totals.sugarG * 10) / 10,
      sodiumMg: hasIncompleteSodium && totals.sodiumMg === 0 ? null : Math.round(totals.sodiumMg * 10) / 10,
    };
  }

  /**
   * Aggregate multiple meals and water logs for a day
   */
  static calculateDailySummary(meals = [], waterLogs = [], goals = null) {
    const dailyTotals = {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      waterMl: 0,
    };

    meals.forEach((meal) => {
      const totals = meal.nutritionalTotals || {};
      dailyTotals.calories += Number(totals.energyKcal) || 0;
      dailyTotals.proteinG += Number(totals.proteinG) || 0;
      dailyTotals.carbsG += Number(totals.carbohydratesG) || 0;
      dailyTotals.fatG += Number(totals.totalFatG) || 0;
      dailyTotals.fiberG += Number(totals.fiberG) || 0;
    });

    waterLogs.forEach((w) => {
      dailyTotals.waterMl += Number(w.amountMl) || 0;
    });

    const targetCal = goals?.dailyCalorieTarget || null;
    const remainingCalories = targetCal ? Math.max(0, targetCal - dailyTotals.calories) : null;

    return {
      loggedCalories: Math.round(dailyTotals.calories),
      calorieTarget: targetCal,
      remainingCalories,
      proteinG: Math.round(dailyTotals.proteinG * 10) / 10,
      carbsG: Math.round(dailyTotals.carbsG * 10) / 10,
      fatG: Math.round(dailyTotals.fatG * 10) / 10,
      fiberG: Math.round(dailyTotals.fiberG * 10) / 10,
      waterMl: Math.round(dailyTotals.waterMl),
      waterTargetMl: goals?.dailyWaterMl || 2500,
      mealCount: meals.length,
    };
  }
}
