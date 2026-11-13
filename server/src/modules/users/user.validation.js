import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    bio: z.string().max(500).optional(),
    age: z.number().min(10).max(120).nullable().optional(),
    gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say', '']).optional(),
    heightCm: z.number().min(50).max(280).nullable().optional(),
    currentWeightKg: z.number().min(20).max(500).nullable().optional(),
    targetWeightKg: z.number().min(20).max(500).nullable().optional(),
    activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very-active', '']).optional(),
  }),
});

export const updatePreferencesSchema = z.object({
  body: z.object({
    dietaryPreferences: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    timezone: z.string().optional(),
  }),
});

export const updateGoalsSchema = z.object({
  body: z.object({
    dailyCalorieTarget: z.number().min(500).max(10000).optional(),
    dailyProteinG: z.number().min(0).max(1000).optional(),
    dailyCarbsG: z.number().min(0).max(2000).optional(),
    dailyFatG: z.number().min(0).max(1000).optional(),
    dailyWaterMl: z.number().min(500).max(15000).optional(),
  }),
});
