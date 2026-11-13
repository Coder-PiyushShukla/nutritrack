import { Router } from 'express';
import { z } from 'zod';
import { AdminService } from './admin.service.js';
import { UsdaFoodProvider } from '../../services/foodProviders/usda.service.js';
import { authenticateUser, requireRole } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validate.js';
import { sendSuccess } from '../../utils/response.js';

const updateUserStatusSchema = z.object({
  body: z.object({
    accountStatus: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED', 'PENDING_APPROVAL']),
    reason: z.string().optional().default(''),
  }),
});

const assignClientSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    nutritionistId: z.string().min(1, 'Nutritionist ID is required'),
    notes: z.string().optional().default(''),
  }),
});

const createFoodSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Food item name required'),
    categoryId: z.string().optional(),
    category: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'pantry', 'general']).optional().default('general'),
    description: z.string().optional(),
    imageReference: z.string().optional(),
    nutrients: z.object({
      energyKcal: z.number().min(0),
      proteinG: z.number().min(0).default(0),
      carbohydratesG: z.number().min(0).default(0),
      totalFatG: z.number().min(0).default(0),
      fiberG: z.number().nullable().optional(),
      sugarG: z.number().nullable().optional(),
      sodiumMg: z.number().nullable().optional(),
    }),
    servingInformation: z
      .object({
        servingSizeGrams: z.number().min(1).default(100),
        servingUnit: z.string().default('100g'),
      })
      .optional(),
  }),
});

const router = Router();

// Strictly protect all administrative routes
router.use(authenticateUser);
router.use(requireRole('ADMIN'));

// Platform Dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const data = await AdminService.getDashboard();
    return sendSuccess(res, data, 'Administrative dashboard retrieved', 200);
  } catch (err) {
    next(err);
  }
});

// User Management
router.get('/users', async (req, res, next) => {
  try {
    const { role, status, page, limit } = req.query;
    const result = await AdminService.listUsers({ role, status, page, limit });
    return sendSuccess(res, result.users, 'Users retrieved', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/status', validateRequest(updateUserStatusSchema), async (req, res, next) => {
  try {
    const user = await AdminService.updateUserStatus(
      req.user._id,
      req.params.id,
      req.body.accountStatus,
      req.body.reason
    );
    return sendSuccess(res, user, 'User status updated', 200);
  } catch (err) {
    next(err);
  }
});

// Nutritionist Applications
router.get('/nutritionist-applications', async (req, res, next) => {
  try {
    const applications = await AdminService.listNutritionistApplications(req.query.status);
    return sendSuccess(res, applications, 'Applications retrieved', 200);
  } catch (err) {
    next(err);
  }
});

router.patch('/nutritionist-applications/:id/approve', async (req, res, next) => {
  try {
    const result = await AdminService.approveNutritionist(req.user._id, req.params.id);
    return sendSuccess(res, result, 'Nutritionist application approved successfully', 200);
  } catch (err) {
    next(err);
  }
});

router.patch('/nutritionist-applications/:id/reject', async (req, res, next) => {
  try {
    const result = await AdminService.rejectNutritionist(
      req.user._id,
      req.params.id,
      req.body.rejectionReason
    );
    return sendSuccess(res, result, 'Nutritionist application rejected', 200);
  } catch (err) {
    next(err);
  }
});

// Client Assignments
router.get('/assignments', async (req, res, next) => {
  try {
    const assignments = await AdminService.listAssignments();
    return sendSuccess(res, assignments, 'Assignments retrieved', 200);
  } catch (err) {
    next(err);
  }
});

router.post('/assignments', validateRequest(assignClientSchema), async (req, res, next) => {
  try {
    const assignment = await AdminService.assignClient(req.user._id, req.body);
    return sendSuccess(res, assignment, 'Client assigned successfully to nutritionist', 201);
  } catch (err) {
    next(err);
  }
});

router.post('/assignments/:id/unassign', async (req, res, next) => {
  try {
    const assignment = await AdminService.unassignClient(
      req.user._id,
      req.params.id,
      req.body.reason
    );
    return sendSuccess(res, assignment, 'Client unassigned successfully', 200);
  } catch (err) {
    next(err);
  }
});

// Food Management
router.post('/foods', validateRequest(createFoodSchema), async (req, res, next) => {
  try {
    const food = await AdminService.createFoodItem(req.user._id, req.body);
    return sendSuccess(res, food, 'Food item created and verified', 201);
  } catch (err) {
    next(err);
  }
});

router.put('/foods/:id', async (req, res, next) => {
  try {
    const food = await AdminService.updateFoodItem(req.user._id, req.params.id, req.body);
    return sendSuccess(res, food, 'Food item updated', 200);
  } catch (err) {
    next(err);
  }
});

router.delete('/foods/:id', async (req, res, next) => {
  try {
    const result = await AdminService.deleteFoodItem(req.params.id);
    return sendSuccess(res, {}, result.message, 200);
  } catch (err) {
    next(err);
  }
});

// USDA Food Search & Import
router.get('/foods/usda-search', async (req, res, next) => {
  try {
    const { query, pageSize } = req.query;
    if (!query) {
      return sendSuccess(res, { foods: [] }, 'Please provide a search query', 200);
    }
    const result = await UsdaFoodProvider.searchFoods(query, pageSize ? Number(pageSize) : 20);
    return sendSuccess(res, result, 'USDA search executed', 200);
  } catch (err) {
    next(err);
  }
});

router.post('/foods/import-usda', async (req, res, next) => {
  try {
    const { foodItem } = req.body;
    const result = await AdminService.importUsdaFood(req.user._id, foodItem);
    return sendSuccess(res, result.food, result.created ? 'Food imported to database' : 'Food record updated', 201);
  } catch (err) {
    next(err);
  }
});

// Audit Logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await AdminService.listAuditLogs({ page, limit });
    return sendSuccess(res, result.logs, 'Audit logs retrieved', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
