import { Router } from 'express';
import { Notification } from '../../models/ProgressRecord.model.js';
import { authenticateUser } from '../../middleware/authenticate.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

const router = Router();
router.use(authenticateUser);

// 1. Get notifications for logged-in user
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { recipientId: req.user._id };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientId: req.user._id, isRead: false }),
    ]);

    return sendSuccess(res, notifications, 'Notifications retrieved', 200, {
      page: Number(page),
      limit: Number(limit),
      total,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
});

// 2. Mark single notification as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) throw new NotFoundError('Notification not found');

    if (notification.recipientId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError('You do not have permission to modify this notification');
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, notification, 'Notification marked as read', 200);
  } catch (err) {
    next(err);
  }
});

// 3. Mark all notifications as read
router.patch('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true }
    );
    return sendSuccess(res, {}, 'All notifications marked as read', 200);
  } catch (err) {
    next(err);
  }
});

export default router;
