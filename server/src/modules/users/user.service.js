import { User } from '../../models/User.model.js';
import { MealLog } from '../../models/MealLog.model.js';
import { WaterLog } from '../../models/WaterLog.model.js';
import { DietPlan } from '../../models/DietPlan.model.js';
import { Notification } from '../../models/ProgressRecord.model.js';
import { RefreshSession } from '../../models/RefreshSession.model.js';
import { NutritionCalculatorService } from '../../services/nutritionCalculator/calculator.service.js';
import { NotFoundError } from '../../utils/errors.js';

export class UserService {
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User profile not found');
    return user;
  }

  static async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User profile not found');

    if (data.name) user.name = data.name.trim();

    user.profile = {
      ...user.profile,
      bio: data.bio ?? user.profile.bio,
      age: data.age !== undefined ? data.age : user.profile.age,
      gender: data.gender ?? user.profile.gender,
      heightCm: data.heightCm !== undefined ? data.heightCm : user.profile.heightCm,
      currentWeightKg: data.currentWeightKg !== undefined ? data.currentWeightKg : user.profile.currentWeightKg,
      targetWeightKg: data.targetWeightKg !== undefined ? data.targetWeightKg : user.profile.targetWeightKg,
      activityLevel: data.activityLevel ?? user.profile.activityLevel,
    };

    await user.save();
    return user;
  }

  static async updatePreferences(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    if (data.dietaryPreferences) user.dietaryPreferences = data.dietaryPreferences;
    if (data.allergies) user.allergies = data.allergies;
    if (data.timezone) user.timezone = data.timezone;

    await user.save();
    return user;
  }

  static async updateGoals(userId, data) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    user.nutritionGoals = {
      ...user.nutritionGoals,
      dailyCalorieTarget: data.dailyCalorieTarget ?? user.nutritionGoals.dailyCalorieTarget,
      dailyProteinG: data.dailyProteinG ?? user.nutritionGoals.dailyProteinG,
      dailyCarbsG: data.dailyCarbsG ?? user.nutritionGoals.dailyCarbsG,
      dailyFatG: data.dailyFatG ?? user.nutritionGoals.dailyFatG,
      dailyWaterMl: data.dailyWaterMl ?? user.nutritionGoals.dailyWaterMl,
    };

    await user.save();
    return user;
  }

  static async getDashboard(userId, localDate) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    // Fallback date to today's UTC if not provided
    const targetDate = localDate || new Date().toISOString().split('T')[0];

    // 1. Fetch real meal logs for this localDate
    const meals = await MealLog.find({ userId, localDate: targetDate }).sort({ createdAt: 1 });

    // 2. Fetch real water logs for this localDate
    const waterLogs = await WaterLog.find({ userId, localDate: targetDate });

    // 3. Centralized nutrition calculation (NO FAKE / DUMMY DATA)
    const summary = NutritionCalculatorService.calculateDailySummary(
      meals,
      waterLogs,
      user.nutritionGoals
    );

    // 4. Fetch current published active diet plan
    const activePlan = await DietPlan.findOne({
      clientId: userId,
      status: 'PUBLISHED',
    })
      .populate('nutritionistId', 'name email profile.avatar')
      .sort({ updatedAt: -1 });

    // 5. Fetch recent notifications
    const recentNotifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      date: targetDate,
      summary,
      meals,
      activePlan,
      notifications: recentNotifications,
      goals: user.nutritionGoals,
    };
  }

  static async deactivateAccount(userId) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    user.accountStatus = 'DELETED';
    await user.save();

    // Revoke all active sessions
    await RefreshSession.updateMany({ userId }, { revokedAt: new Date() });

    return { message: 'Account deactivated successfully' };
  }
}
