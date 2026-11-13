import { Router } from 'express';
import { z } from 'zod';
import { WaterLog } from '../../models/WaterLog.model.js';
import { authenticateUser } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validate.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

const logWaterSchema = z.object({
  body: z.object({
    amountMl: z.number().min(1, 'Amount must be at least 1 ml').max(10000, 'Cannot exceed 10000 ml'),
    localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  }),
});

const router = Router();
router.use(authenticateUser);

// 1. Get water logs for user and date
router.get('/', async (req, res, next) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user._id };
    if (date) filter.localDate = date;

    const logs = await WaterLog.find(filter).sort({ loggedAt: -1 });
    return sendSuccess(res, logs, 'Water logs retrieved', 200);
  } catch (err) {
    next(err);
  }
});

// 2. Log water intake
router.post('/', validateRequest(logWaterSchema), async (req, res, next) => {
  try {
    const { amountMl, localDate } = req.body;
    const log = await WaterLog.create({
      userId: req.user._id,
      amountMl,
      localDate,
    });
    return sendSuccess(res, log, 'Water intake logged successfully', 201);
  } catch (err) {
    next(err);
  }
});

// 3. Delete water log
router.delete('/:id', async (req, res, next) => {
  try {
    const log = await WaterLog.findById(req.params.id);
    if (!log) throw new NotFoundError('Water log not found');

    if (log.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not have permission to delete this water log');
    }

    await WaterLog.deleteOne({ _id: req.params.id });
    return sendSuccess(res, {}, 'Water log deleted successfully', 200);
  } catch (err) {
    next(err);
  }
});

// 4. Water summary
router.get('/summary', async (req, res, next) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    const logs = await WaterLog.find({ userId: req.user._id, localDate: targetDate });

    const totalMl = logs.reduce((acc, curr) => acc + curr.amountMl, 0);
    const targetMl = req.user.nutritionGoals?.dailyWaterMl || 2500;

    return sendSuccess(
      res,
      {
        date: targetDate,
        totalMl,
        targetMl,
        remainingMl: Math.max(0, targetMl - totalMl),
        logsCount: logs.length,
      },
      'Water summary retrieved',
      200
    );
  } catch (err) {
    next(err);
  }
});

export default router;
