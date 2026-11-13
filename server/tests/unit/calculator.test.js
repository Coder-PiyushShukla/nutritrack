import { NutritionCalculatorService } from '../../src/services/nutritionCalculator/calculator.service.js';

describe('NutritionCalculatorService Unit Tests', () => {
  describe('calculateItemNutrients (Per-100g standard formula)', () => {
    it('should correctly calculate nutrients for a 150g portion based on 100g standard values', () => {
      const nutrientsPer100g = {
        energyKcal: 200,
        proteinG: 10,
        carbohydratesG: 30,
        totalFatG: 5,
        fiberG: 4,
        sugarG: 6,
        sodiumMg: 150,
      };

      const result = NutritionCalculatorService.calculateItemNutrients(nutrientsPer100g, 150);

      // (150 / 100) * 200 = 300 kcal
      expect(result.energyKcal).toBe(300);
      // (150 / 100) * 10 = 15g protein
      expect(result.proteinG).toBe(15);
      // (150 / 100) * 30 = 45g carbs
      expect(result.carbohydratesG).toBe(45);
      // (150 / 100) * 5 = 7.5g fat
      expect(result.totalFatG).toBe(7.5);
      // (150 / 100) * 4 = 6g fiber
      expect(result.fiberG).toBe(6);
      // (150 / 100) * 6 = 9g sugar
      expect(result.sugarG).toBe(9);
      // (150 / 100) * 150 = 225mg sodium
      expect(result.sodiumMg).toBe(225);
    });

    it('should preserve null/missing nutrients as null instead of fabricating zero', () => {
      const incompleteNutrients = {
        energyKcal: 120,
        proteinG: 4,
        carbohydratesG: 22,
        totalFatG: 1,
        fiberG: null,
        sugarG: null,
        sodiumMg: null,
      };

      const result = NutritionCalculatorService.calculateItemNutrients(incompleteNutrients, 200);

      expect(result.energyKcal).toBe(240);
      expect(result.proteinG).toBe(8);
      expect(result.fiberG).toBeNull();
      expect(result.sugarG).toBeNull();
      expect(result.sodiumMg).toBeNull();
    });

    it('should throw error for non-positive portion weights', () => {
      expect(() => {
        NutritionCalculatorService.calculateItemNutrients({ energyKcal: 100 }, 0);
      }).toThrow();

      expect(() => {
        NutritionCalculatorService.calculateItemNutrients({ energyKcal: 100 }, -50);
      }).toThrow();
    });
  });

  describe('calculateMealTotals', () => {
    it('should aggregate multiple items into accurate meal totals', () => {
      const items = [
        {
          nutritionalSnapshot: {
            energyKcal: 250,
            proteinG: 15,
            carbohydratesG: 30,
            totalFatG: 8,
            fiberG: 3,
            sugarG: 4,
            sodiumMg: 200,
          },
        },
        {
          nutritionalSnapshot: {
            energyKcal: 150,
            proteinG: 5,
            carbohydratesG: 25,
            totalFatG: 2,
            fiberG: 4,
            sugarG: 10,
            sodiumMg: 50,
          },
        },
      ];

      const totals = NutritionCalculatorService.calculateMealTotals(items);

      expect(totals.energyKcal).toBe(400);
      expect(totals.proteinG).toBe(20);
      expect(totals.carbohydratesG).toBe(55);
      expect(totals.totalFatG).toBe(10);
      expect(totals.fiberG).toBe(7);
      expect(totals.sugarG).toBe(14);
      expect(totals.sodiumMg).toBe(250);
    });
  });

  describe('calculateDailySummary', () => {
    it('should calculate daily totals and remaining calories based on calorie target', () => {
      const meals = [
        {
          nutritionalTotals: {
            energyKcal: 500,
            proteinG: 30,
            carbohydratesG: 60,
            totalFatG: 15,
            fiberG: 8,
          },
        },
        {
          nutritionalTotals: {
            energyKcal: 700,
            proteinG: 45,
            carbohydratesG: 70,
            totalFatG: 25,
            fiberG: 10,
          },
        },
      ];

      const waterLogs = [{ amountMl: 500 }, { amountMl: 750 }];

      const goals = {
        dailyCalorieTarget: 2000,
        dailyWaterMl: 2500,
      };

      const summary = NutritionCalculatorService.calculateDailySummary(meals, waterLogs, goals);

      expect(summary.loggedCalories).toBe(1200);
      expect(summary.calorieTarget).toBe(2000);
      expect(summary.remainingCalories).toBe(800); // 2000 - 1200
      expect(summary.proteinG).toBe(75);
      expect(summary.carbsG).toBe(130);
      expect(summary.fatG).toBe(40);
      expect(summary.waterMl).toBe(1250);
      expect(summary.mealCount).toBe(2);
    });
  });
});
