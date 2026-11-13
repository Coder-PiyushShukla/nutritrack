import { Router } from 'express';
import { z } from 'zod';
import { NutritionistService } from './nutritionist.service.js';
import { authenticateUser, requireRole, requireApprovedNutritionist } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validate.js';
import { sendSuccess } from '../../utils/response.js';

const createPlanSchema = z.object({
  body: z.object({
    clientId: z.string().min(1, 'Client ID is required'),
    planName: z.string().min(2, 'Plan name is required'),
    description: z.string().optional(),
    durationDays: z.number().min(1).max(365).optional().default(7),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    dailyTargets: z.object({
      calorieTarget: z.number().min(500).max(10000),
      proteinG: z.number().min(0).max(1000),
      carbsG: z.number().min(0).max(2000),
      fatG: z.number().min(0).max(1000),
      waterMl: z.number().min(500).max(15000).optional().default(2500),
    }),
    weeklySchedule: z.array(z.any()).optional().default([]),
  }),
});

const router = Router();

// Strictly protect all nutritionist routes
router.use(authenticateUser);
router.use(requireRole('NUTRITIONIST'));
router.use(requireApprovedNutritionist);

// Dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const data = await NutritionistService.getDashboard(req.user._id);
    return sendSuccess(res, data, 'Nutritionist dashboard retrieved', 200);
  } catch (err) {
    next(err);
  }
});

// Clients Management
router.get('/clients', async (req, res, next) => {
  try {
    const clients = await NutritionistService.getAssignedClients(req.user._id);
    return sendSuccess(res, clients, 'Assigned clients retrieved', 200);
  } catch (err) {
    next(err);
  }
});

router.get('/clients/:clientId', async (req, res, next) => {
  try {
    const data = await NutritionistService.getClientDetails(req.user._id, req.params.clientId);
    return sendSuccess(res, data, 'Client details retrieved', 200);
  } catch (err) {
    next(err);
  }
});

router.get('/clients/:clientId/meals', async (req, res, next) => {
  try {
    const { date, page, limit } = req.query;
    const data = await NutritionistService.getClientMeals(req.user._id, req.params.clientId, {
      date,
      page,
      limit,
    });
    return sendSuccess(res, data.meals, 'Client meals retrieved', 200, {
      total: data.total,
      page: data.page,
      limit: data.limit,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/clients/:clientId/progress', async (req, res, next) => {
  try {
    const records = await NutritionistService.getClientProgress(req.user._id, req.params.clientId);
    return sendSuccess(res, records, 'Client progress retrieved', 200);
  } catch (err) {
    next(err);
  }
});

// Diet Plan Management
router.post('/diet-plans', validateRequest(createPlanSchema), async (req, res, next) => {
  try {
    const plan = await NutritionistService.createDietPlan(req.user._id, req.body);
    return sendSuccess(res, plan, 'Draft diet plan created', 201);
  } catch (err) {
    next(err);
  }
});

router.get('/diet-plans', async (req, res, next) => {
  try {
    const { clientId, status } = req.query;
    const plans = await NutritionistService.listDietPlans(req.user._id, { clientId, status });
    return sendSuccess(res, plans, 'Diet plans retrieved', 200);
  } catch (err) {
    next(err);
  }
});

router.put('/diet-plans/:id', async (req, res, next) => {
  try {
    const plan = await NutritionistService.updateDietPlan(req.user._id, req.params.id, req.body);
    return sendSuccess(res, plan, 'Diet plan updated', 200);
  } catch (err) {
    next(err);
  }
});

router.post('/diet-plans/:id/publish', async (req, res, next) => {
  try {
    const plan = await NutritionistService.publishDietPlan(req.user._id, req.params.id);
    return sendSuccess(res, plan, 'Diet plan published and assigned to client', 200);
  } catch (err) {
    next(err);
  }
});

router.post('/diet-plans/:id/archive', async (req, res, next) => {
  try {
    const plan = await NutritionistService.archiveDietPlan(req.user._id, req.params.id);
    return sendSuccess(res, plan, 'Diet plan archived', 200);
  } catch (err) {
    next(err);
  }
});

export default router;
