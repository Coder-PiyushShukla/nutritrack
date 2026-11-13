import { Router } from 'express';
import { z } from 'zod';
import { ProgressRecord } from '../../models/ProgressRecord.model.js';
import { MealLog } from '../../models/MealLog.model.js';
import { WaterLog } from '../../models/WaterLog.model.js';
import { authenticateUser } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validate.js';
import { sendSuccess } from '../../utils/response.js';

const logProgressSchema = z.object({
  body: z.object({
    localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
    weightKg: z.number().min(20).max(500).optional(),
    notes: z.string().optional(),
  }),
});

const router = Router();
router.use(authenticateUser);

// 1. Post a progress metric / weight
router.post('/records', validateRequest(logProgressSchema), async (req, res, next) => {
  try {
    const { localDate, weightKg, notes } = req.body;

    const record = await ProgressRecord.findOneAndUpdate(
      { userId: req.user._id, localDate },
      {
        $set: {
          weightKg: weightKg !== undefined ? weightKg : undefined,
          notes: notes !== undefined ? notes : undefined,
        },
      },
      { upsert: true, new: true }
    );

    // Also update user's currentWeightKg if weight provided
    if (weightKg) {
      req.user.profile.currentWeightKg = weightKg;
      await req.user.save();
    }

    return sendSuccess(res, record, 'Progress record saved', 201);
  } catch (err) {
    next(err);
  }
});

// 2. Weekly Progress Aggregates (Real records only — NO FAKE CHARTS)
router.get('/weekly', async (req, res, next) => {
  try {
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const startDate = start.toISOString().split('T')[0];

    const [meals, waterLogs, weightRecords] = await Promise.all([
      MealLog.find({
        userId: req.user._id,
        localDate: { $gte: startDate, $lte: endDate },
      }),
      WaterLog.find({
        userId: req.user._id,
        localDate: { $gte: startDate, $lte: endDate },
      }),
      ProgressRecord.find({
        userId: req.user._id,
        localDate: { $gte: startDate, $lte: endDate },
      }),
    ]);

    // Build day-by-day real records
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dayStr = d.toISOString().split('T')[0];

      const dayMeals = meals.filter((m) => m.localDate === dayStr);
      const dayWater = waterLogs.filter((w) => w.localDate === dayStr);
      const dayWeight = weightRecords.find((r) => r.localDate === dayStr);

      const calories = dayMeals.reduce((acc, m) => acc + (m.nutritionalTotals?.energyKcal || 0), 0);
      const proteinG = dayMeals.reduce((acc, m) => acc + (m.nutritionalTotals?.proteinG || 0), 0);
      const carbsG = dayMeals.reduce((acc, m) => acc + (m.nutritionalTotals?.carbohydratesG || 0), 0);
      const fatG = dayMeals.reduce((acc, m) => acc + (m.nutritionalTotals?.totalFatG || 0), 0);
      const waterMl = dayWater.reduce((acc, w) => acc + (w.amountMl || 0), 0);

      days.push({
        date: dayStr,
        calories: Math.round(calories),
        proteinG: Math.round(proteinG * 10) / 10,
        carbsG: Math.round(carbsG * 10) / 10,
        fatG: Math.round(fatG * 10) / 10,
        waterMl,
        weightKg: dayWeight ? dayWeight.weightKg : null,
      });
    }

    return sendSuccess(res, { startDate, endDate, days }, 'Weekly progress retrieved', 200);
  } catch (err) {
    next(err);
  }
});

// 3. Progress Summary
router.get('/summary', async (req, res, next) => {
  try {
    const latestWeight = await ProgressRecord.findOne({
      userId: req.user._id,
      weightKg: { $ne: null },
    }).sort({ localDate: -1 });

    const totalMealsLogged = await MealLog.countDocuments({ userId: req.user._id });

    return sendSuccess(
      res,
      {
        currentWeightKg: latestWeight ? latestWeight.weightKg : req.user.profile?.currentWeightKg || null,
        targetWeightKg: req.user.profile?.targetWeightKg || null,
        totalMealsLogged,
        calorieTarget: req.user.nutritionGoals?.dailyCalorieTarget || null,
      },
      'Progress summary retrieved',
      200
    );
  } catch (err) {
    next(err);
  }
});

export default router;
