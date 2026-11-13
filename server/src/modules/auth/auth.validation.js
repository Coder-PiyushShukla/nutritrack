import { z } from 'zod';

const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: passwordValidation,
    dietaryPreferences: z.array(z.string()).optional().default([]),
    allergies: z.array(z.string()).optional().default([]),
    nutritionGoals: z
      .object({
        dailyCalorieTarget: z.number().min(500).max(10000).optional(),
        dailyProteinG: z.number().min(0).max(1000).optional(),
        dailyCarbsG: z.number().min(0).max(2000).optional(),
        dailyFatG: z.number().min(0).max(1000).optional(),
        dailyWaterMl: z.number().min(500).max(15000).optional(),
      })
      .optional(),
    timezone: z.string().optional().default('UTC'),
    profile: z
      .object({
        age: z.number().min(10).max(120).optional(),
        gender: z.string().optional(),
        heightCm: z.number().min(50).max(280).optional(),
        currentWeightKg: z.number().min(20).max(500).optional(),
        targetWeightKg: z.number().min(20).max(500).optional(),
        activityLevel: z.string().optional(),
      })
      .optional(),
  }),
});

export const applyNutritionistSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: passwordValidation,
    qualification: z.string().trim().min(3, 'Qualification is required'),
    specialization: z.string().trim().min(3, 'Specialization is required'),
    experienceYears: z.coerce.number().min(0, 'Experience years must be 0 or greater'),
    professionalDescription: z.string().trim().min(20, 'Please provide a descriptive professional bio'),
    credentialReferences: z.array(z.string()).optional().default([]),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(1, 'Verification token is required'),
    email: z.string().email('Invalid email query parameter').toLowerCase(),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    email: z.string().email('Invalid email address').toLowerCase(),
    newPassword: passwordValidation,
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
  }),
});
