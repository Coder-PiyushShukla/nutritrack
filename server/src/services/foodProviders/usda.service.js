import { env } from '../../config/env.js';

export class UsdaFoodProvider {
  static isConfigured() {
    return Boolean(env.FOOD_DATA_API_KEY && env.FOOD_DATA_API_KEY.trim() !== '');
  }

  /**
   * Search USDA FoodData Central
   * @param {string} query
   * @param {number} pageSize
   */
  static async searchFoods(query, pageSize = 20) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'USDA FoodData Central API key is not configured on the server',
        foods: [],
      };
    }

    const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
    url.searchParams.set('api_key', env.FOOD_DATA_API_KEY);
    url.searchParams.set('query', query);
    url.searchParams.set('pageSize', String(pageSize));
    url.searchParams.set('dataType', 'Foundation,SR Legacy');

    try {
      const response = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`USDA API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const foods = (data.foods || []).map((food) => this.mapUsdaFoodToItem(food));

      return {
        configured: true,
        totalHits: data.totalHits || 0,
        foods,
      };
    } catch (err) {
      console.error('USDA API Error:', err.message);
      return {
        configured: true,
        error: err.message,
        foods: [],
      };
    }
  }

  /**
   * Map USDA food nutrient array to standardized 100g nutrient object
   */
  static mapUsdaFoodToItem(usdaFood) {
    const nutrients = {
      energyKcal: 0,
      proteinG: 0,
      carbohydratesG: 0,
      totalFatG: 0,
      fiberG: null,
      sugarG: null,
      sodiumMg: null,
    };

    (usdaFood.foodNutrients || []).forEach((n) => {
      const num = n.nutrientNumber;
      const value = n.value;
      if (value === null || value === undefined) return;

      // USDA Nutrient IDs
      // 208 = Energy (kcal)
      // 203 = Protein (g)
      // 205 = Carbohydrate, by difference (g)
      // 204 = Total lipid (fat) (g)
      // 291 = Fiber, total dietary (g)
      // 269 = Sugars, total including NLEA (g)
      // 307 = Sodium, Na (mg)
      if (num === '208' || n.nutrientName?.includes('Energy')) nutrients.energyKcal = Math.round(value);
      if (num === '203') nutrients.proteinG = Math.round(value * 10) / 10;
      if (num === '205') nutrients.carbohydratesG = Math.round(value * 10) / 10;
      if (num === '204') nutrients.totalFatG = Math.round(value * 10) / 10;
      if (num === '291') nutrients.fiberG = Math.round(value * 10) / 10;
      if (num === '269') nutrients.sugarG = Math.round(value * 10) / 10;
      if (num === '307') nutrients.sodiumMg = Math.round(value * 10) / 10;
    });

    return {
      name: usdaFood.description,
      normalizedName: usdaFood.description.toLowerCase(),
      source: 'USDA_FDC',
      sourceReference: String(usdaFood.fdcId),
      nutrients,
      servingInformation: {
        servingSizeGrams: 100,
        servingUnit: '100g',
        householdMeasure: usdaFood.servingSizeUnit || '100 grams',
      },
      category: 'general',
    };
  }
}
