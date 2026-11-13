import { UserService } from './user.service.js';
import { sendSuccess } from '../../utils/response.js';

export class UserController {
  static async getMe(req, res, next) {
    try {
      const profile = await UserService.getProfile(req.user._id);
      return sendSuccess(res, profile, 'User profile retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const updated = await UserService.updateProfile(req.user._id, req.body);
      return sendSuccess(res, updated, 'Profile updated successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  static async updatePreferences(req, res, next) {
    try {
      const updated = await UserService.updatePreferences(req.user._id, req.body);
      return sendSuccess(res, updated, 'Dietary preferences updated', 200);
    } catch (err) {
      next(err);
    }
  }

  static async updateGoals(req, res, next) {
    try {
      const updated = await UserService.updateGoals(req.user._id, req.body);
      return sendSuccess(res, updated, 'Nutritional targets updated', 200);
    } catch (err) {
      next(err);
    }
  }

  static async getDashboard(req, res, next) {
    try {
      const localDate = req.query.date;
      const dashboardData = await UserService.getDashboard(req.user._id, localDate);
      return sendSuccess(res, dashboardData, 'Dashboard data retrieved successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const result = await UserService.deactivateAccount(req.user._id);
      return sendSuccess(res, result, result.message, 200);
    } catch (err) {
      next(err);
    }
  }
}
