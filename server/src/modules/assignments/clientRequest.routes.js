import { Router } from 'express';
import { z } from 'zod';
import { ClientRequest } from '../../models/ClientAssignment.model.js';
import { Notification } from '../../models/ProgressRecord.model.js';
import { User } from '../../models/User.model.js';
import { authenticateUser } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validate.js';
import { sendSuccess } from '../../utils/response.js';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors.js';

const requestSchema = z.object({
  body: z.object({
    dietaryGoal: z.string().optional().default(''),
    preferredSpecialization: z.string().optional().default(''),
    notes: z.string().optional().default(''),
  }),
});

const router = Router();
router.use(authenticateUser);

// 1. Submit request for a clinical nutritionist
router.post('/', validateRequest(requestSchema), async (req, res, next) => {
  try {
    // Check if there is already a pending request
    const existing = await ClientRequest.findOne({
      userId: req.user._id,
      status: 'PENDING',
    });

    if (existing) {
      throw new ConflictError('You already have a pending nutritionist request under review');
    }

    const clientRequest = await ClientRequest.create({
      userId: req.user._id,
      dietaryGoal: req.body.dietaryGoal,
      preferredSpecialization: req.body.preferredSpecialization,
      notes: req.body.notes,
      status: 'PENDING',
    });

    // Notify admins of new client request
    const admins = await User.find({ role: 'ADMIN' });
    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          recipientId: admin._id,
          title: 'New Nutritionist Request',
          message: `${req.user.name} submitted a request for nutritionist assignment`,
          type: 'NUTRITIONIST_REQUEST',
          relatedResourceId: clientRequest._id,
        })
      )
    );

    return sendSuccess(res, clientRequest, 'Nutritionist request submitted successfully', 201);
  } catch (err) {
    next(err);
  }
});

// 2. Get user's own requests
router.get('/my-requests', async (req, res, next) => {
  try {
    const requests = await ClientRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, requests, 'Requests retrieved', 200);
  } catch (err) {
    next(err);
  }
});

// 3. Cancel request
router.delete('/:id', async (req, res, next) => {
  try {
    const request = await ClientRequest.findById(req.params.id);
    if (!request) throw new NotFoundError('Request not found');

    if (request.userId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not have permission to cancel this request');
    }

    request.status = 'CANCELLED';
    await request.save();

    return sendSuccess(res, {}, 'Nutritionist request cancelled', 200);
  } catch (err) {
    next(err);
  }
});

export default router;
