import { User } from '../../models/User.model.js';
import { ClientAssignment } from '../../models/ClientAssignment.model.js';
import { MealLog } from '../../models/MealLog.model.js';
import { WaterLog } from '../../models/WaterLog.model.js';
import { DietPlan } from '../../models/DietPlan.model.js';
import { ProgressRecord, Notification } from '../../models/ProgressRecord.model.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors.js';

export class NutritionistService {
  /**
   * 1. Nutritionist Dashboard (100% Real Aggregations)
   */
  static async getDashboard(nutritionistId) {
    // 1. Fetch active assignments
    const activeAssignments = await ClientAssignment.find({
      nutritionistId,
      status: 'ACTIVE',
    }).populate('userId', 'name email profile dietaryPreferences nutritionGoals');

    const clientIds = activeAssignments.map((a) => a.userId?._id).filter(Boolean);

    // 2. Fetch recent meals logged by assigned clients
    const recentClientMeals = await MealLog.find({
      userId: { $in: clientIds },
    })
      .populate('userId', 'name email profile.avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // 3. Count published diet plans
    const [publishedPlansCount, draftPlansCount] = await Promise.all([
      DietPlan.countDocuments({ nutritionistId, status: 'PUBLISHED' }),
      DietPlan.countDocuments({ nutritionistId, status: 'DRAFT' }),
    ]);

    // 4. Compute adherence: clients who logged meals in the last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dateStr = threeDaysAgo.toISOString().split('T')[0];

    const activeRecentLoggers = await MealLog.distinct('userId', {
      userId: { $in: clientIds },
      localDate: { $gte: dateStr },
    });

    const clientsOverview = activeAssignments.map((a) => {
      const u = a.userId;
      const isRecentlyActive = activeRecentLoggers.some((id) => id.toString() === u?._id.toString());
      return {
        id: u?._id,
        name: u?.name,
        email: u?.email,
        avatar: u?.profile?.avatar || '',
        goal: u?.profile?.bio || 'General Wellness',
        targetKcal: u?.nutritionGoals?.dailyCalorieTarget || 2000,
        status: isRecentlyActive ? 'active' : 'review_needed',
        assignedAt: a.assignedAt,
        dietPreference: (u?.dietaryPreferences || []).join(', ') || 'Omnivore',
      };
    });

    return {
      totalAssignedClients: clientIds.length,
      activeClientsCount: activeRecentLoggers.length,
      publishedPlansCount,
      draftPlansCount,
      clients: clientsOverview,
      recentActivity: recentClientMeals,
    };
  }

  /**
   * 2. List assigned clients
   */
  static async getAssignedClients(nutritionistId) {
    const assignments = await ClientAssignment.find({
      nutritionistId,
      status: 'ACTIVE',
    }).populate('userId', 'name email profile dietaryPreferences allergies nutritionGoals createdAt');

    return assignments.map((a) => a.userId).filter(Boolean);
  }

  /**
   * 3. Get client details (Verifies assignment)
   */
  static async getClientDetails(nutritionistId, clientId) {
    const assignment = await ClientAssignment.findOne({
      nutritionistId,
      userId: clientId,
      status: 'ACTIVE',
    });

    if (!assignment) {
      throw new ForbiddenError('You do not have active authorization to access this client profile');
    }

    const client = await User.findById(clientId);
    if (!client) throw new NotFoundError('Client not found');

    const activePlan = await DietPlan.findOne({
      clientId,
      nutritionistId,
      status: 'PUBLISHED',
    }).sort({ updatedAt: -1 });

    return { client, assignment, activePlan };
  }

  /**
   * 4. Get client meal logs (Verifies assignment)
   */
  static async getClientMeals(nutritionistId, clientId, { date, page = 1, limit = 50 }) {
    const assignment = await ClientAssignment.findOne({
      nutritionistId,
      userId: clientId,
      status: 'ACTIVE',
    });

    if (!assignment) {
      throw new ForbiddenError('You do not have authorization to view this client meal history');
    }

    const filter = { userId: clientId };
    if (date) filter.localDate = date;

    const skip = (Math.max(1, page) - 1) * limit;

    const [meals, total] = await Promise.all([
      MealLog.find(filter).sort({ localDate: -1, createdAt: -1 }).skip(skip).limit(limit),
      MealLog.countDocuments(filter),
    ]);

    return { meals, total, page: Number(page), limit: Number(limit) };
  }

  /**
   * 5. Get client progress records (Verifies assignment)
   */
  static async getClientProgress(nutritionistId, clientId) {
    const assignment = await ClientAssignment.findOne({
      nutritionistId,
      userId: clientId,
      status: 'ACTIVE',
    });

    if (!assignment) {
      throw new ForbiddenError('You do not have authorization to view this client progress history');
    }

    const records = await ProgressRecord.find({ userId: clientId }).sort({ localDate: -1 }).limit(30);
    return records;
  }

  /**
   * 6. Create Draft Diet Plan
   */
  static async createDietPlan(nutritionistId, data) {
    // Verify client is actively assigned
    const assignment = await ClientAssignment.findOne({
      nutritionistId,
      userId: data.clientId,
      status: 'ACTIVE',
    });

    if (!assignment) {
      throw new ForbiddenError('You can only create diet plans for actively assigned clients');
    }

    const plan = await DietPlan.create({
      clientId: data.clientId,
      nutritionistId,
      planName: data.planName,
      description: data.description || '',
      durationDays: data.durationDays || 7,
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      dailyTargets: data.dailyTargets,
      weeklySchedule: data.weeklySchedule || [],
      status: 'DRAFT',
      revision: 1,
      revisionHistory: [
        {
          revisionNumber: 1,
          modifiedAt: new Date(),
          modifiedBy: nutritionistId,
          changeSummary: 'Initial draft creation',
        },
      ],
    });

    return plan;
  }

  /**
   * 7. Update Draft / Active Diet Plan
   */
  static async updateDietPlan(nutritionistId, planId, data) {
    const plan = await DietPlan.findById(planId);
    if (!plan) throw new NotFoundError('Diet plan not found');

    if (plan.nutritionistId.toString() !== nutritionistId.toString()) {
      throw new ForbiddenError('You do not have permission to edit this diet plan');
    }

    if (data.planName) plan.planName = data.planName;
    if (data.description !== undefined) plan.description = data.description;
    if (data.durationDays) plan.durationDays = data.durationDays;
    if (data.startDate) plan.startDate = data.startDate;
    if (data.endDate) plan.endDate = data.endDate;
    if (data.dailyTargets) plan.dailyTargets = data.dailyTargets;
    if (data.weeklySchedule) plan.weeklySchedule = data.weeklySchedule;

    plan.revision += 1;
    plan.revisionHistory.push({
      revisionNumber: plan.revision,
      modifiedAt: new Date(),
      modifiedBy: nutritionistId,
      changeSummary: data.changeSummary || `Revision ${plan.revision} saved`,
    });

    await plan.save();

    // If already published, notify user of update
    if (plan.status === 'PUBLISHED') {
      await Notification.create({
        recipientId: plan.clientId,
        title: 'Diet Plan Updated',
        message: `Your nutritionist updated "${plan.planName}" (Rev. ${plan.revision})`,
        type: 'DIET_PLAN_UPDATED',
        relatedResourceId: plan._id,
      });
    }

    return plan;
  }

  /**
   * 8. Publish Diet Plan
   */
  static async publishDietPlan(nutritionistId, planId) {
    const plan = await DietPlan.findById(planId);
    if (!plan) throw new NotFoundError('Diet plan not found');

    if (plan.nutritionistId.toString() !== nutritionistId.toString()) {
      throw new ForbiddenError('You do not have permission to publish this plan');
    }

    // Archive previous active plans for this client
    await DietPlan.updateMany(
      { clientId: plan.clientId, status: 'PUBLISHED', _id: { $ne: plan._id } },
      { status: 'ARCHIVED' }
    );

    plan.status = 'PUBLISHED';
    await plan.save();

    // Update user's daily goals with the published plan targets
    await User.findByIdAndUpdate(plan.clientId, {
      $set: {
        'nutritionGoals.dailyCalorieTarget': plan.dailyTargets.calorieTarget,
        'nutritionGoals.dailyProteinG': plan.dailyTargets.proteinG,
        'nutritionGoals.dailyCarbsG': plan.dailyTargets.carbsG,
        'nutritionGoals.dailyFatG': plan.dailyTargets.fatG,
        'nutritionGoals.dailyWaterMl': plan.dailyTargets.waterMl || 2500,
      },
    });

    // Notify client of published plan
    await Notification.create({
      recipientId: plan.clientId,
      title: 'New Diet Plan Assigned',
      message: `Your nutritionist published a personalized plan: "${plan.planName}"`,
      type: 'DIET_PLAN_ASSIGNED',
      relatedResourceId: plan._id,
    });

    return plan;
  }

  /**
   * 9. Archive Diet Plan
   */
  static async archiveDietPlan(nutritionistId, planId) {
    const plan = await DietPlan.findById(planId);
    if (!plan) throw new NotFoundError('Diet plan not found');

    if (plan.nutritionistId.toString() !== nutritionistId.toString()) {
      throw new ForbiddenError('You do not have permission to archive this plan');
    }

    plan.status = 'ARCHIVED';
    await plan.save();
    return plan;
  }

  /**
   * 10. List Nutritionist Diet Plans
   */
  static async listDietPlans(nutritionistId, { clientId, status }) {
    const filter = { nutritionistId };
    if (clientId) filter.clientId = clientId;
    if (status) filter.status = status;

    return DietPlan.find(filter)
      .populate('clientId', 'name email profile.avatar')
      .sort({ updatedAt: -1 });
  }
}
