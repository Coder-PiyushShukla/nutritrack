import { z } from 'zod';

export const logMealSchema = z.object({
  body: z.object({
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
    localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    time: z.string().optional(),
    items: z
      .array(
        z.object({
          foodItemId: z.string().optional(),
          name: z.string().min(1, 'Item name is required'),
          portionGrams: z.number().min(1, 'Portion grams must be at least 1g'),
          servingUnit: z.string().optional().default('g'),
          // Optional manual nutrients if not linked to foodItemId
          nutrients: z
            .object({
              energyKcal: z.number().min(0),
              proteinG: z.number().min(0).default(0),
              carbohydratesG: z.number().min(0).default(0),
              totalFatG: z.number().min(0).default(0),
              fiberG: z.number().nullable().optional(),
              sugarG: z.number().nullable().optional(),
              sodiumMg: z.number().nullable().optional(),
            })
            .optional(),
        })
      )
      .min(1, 'At least one food item must be included in the meal'),
    notes: z.string().optional().default(''),
  }),
});

export const updateMealSchema = z.object({
  body: z.object({
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).optional(),
    localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    time: z.string().optional(),
    items: z
      .array(
        z.object({
          foodItemId: z.string().optional(),
          name: z.string().min(1),
          portionGrams: z.number().min(1),
          servingUnit: z.string().optional().default('g'),
          nutrients: z
            .object({
              energyKcal: z.number().min(0),
              proteinG: z.number().min(0).default(0),
              carbohydratesG: z.number().min(0).default(0),
              totalFatG: z.number().min(0).default(0),
              fiberG: z.number().nullable().optional(),
              sugarG: z.number().nullable().optional(),
              sodiumMg: z.number().nullable().optional(),
            })
            .optional(),
        })
      )
      .optional(),
    notes: z.string().optional(),
  }),
});
