import { User } from '../../models/User.model.js';
import { NutritionistApplication } from '../../models/NutritionistApplication.model.js';
import { ClientAssignment, ClientRequest } from '../../models/ClientAssignment.model.js';
import { FoodItem, FoodCategory } from '../../models/Food.model.js';
import { Recipe } from '../../models/Recipe.model.js';
import { MealLog } from '../../models/MealLog.model.js';
import { DietPlan } from '../../models/DietPlan.model.js';
import { Notification, AuditLog } from '../../models/ProgressRecord.model.js';
import { UsdaFoodProvider } from '../../services/foodProviders/usda.service.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';

export class AdminService {
  /**
   * 1. Admin Platform Dashboard (100% Real Aggregation Queries)
   */
  static async getDashboard() {
    const [
      totalUsers,
      totalNutritionists,
      pendingApplications,
      activeAccounts,
      publishedPlans,
      foodRecordsCount,
      totalMealsLogged,
      recentAuditLogs,
      pendingClientRequests,
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'NUTRITIONIST' }),
      NutritionistApplication.countDocuments({ approvalStatus: 'PENDING' }),
      User.countDocuments({ accountStatus: 'ACTIVE' }),
      DietPlan.countDocuments({ status: 'PUBLISHED' }),
      FoodItem.countDocuments({ verificationStatus: 'VERIFIED' }),
      MealLog.countDocuments(),
      AuditLog.find().sort({ timestamp: -1 }).limit(8),
      ClientRequest.countDocuments({ status: 'PENDING' }),
    ]);

    return {
      totalUsers,
      totalNutritionists,
      pendingApplications,
      activeAccounts,
      publishedPlans,
      foodRecordsCount,
      totalMealsLogged,
      pendingClientRequests,
      recentAuditLogs,
    };
  }

  /**
   * 2. Manage Users
   */
  static async listUsers({ role, status, page = 1, limit = 50 }) {
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.accountStatus = status;

    const skip = (Math.max(1, page) - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return { users, total, page: Number(page), limit: Number(limit) };
  }

  static async updateUserStatus(adminId, userId, accountStatus, reason = '') {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const oldStatus = user.accountStatus;
    user.accountStatus = accountStatus;
    await user.save();

    await AuditLog.create({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'UPDATE_USER_STATUS',
      resourceType: 'User',
      resourceId: user._id.toString(),
      reason,
      metadata: { oldStatus, newStatus: accountStatus },
    });

    return user;
  }

  /**
   * 3. Review Nutritionist Applications
   */
  static async listNutritionistApplications(status = null) {
    const filter = {};
    if (status) filter.approvalStatus = status;

    return NutritionistApplication.find(filter)
      .populate('userId', 'name email createdAt profile')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  static async approveNutritionist(adminId, applicationId) {
    const application = await NutritionistApplication.findById(applicationId);
    if (!application) throw new NotFoundError('Nutritionist application not found');

    if (application.approvalStatus === 'APPROVED') {
      throw new ConflictError('Application is already approved');
    }

    application.approvalStatus = 'APPROVED';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    // Activate the user account
    const user = await User.findByIdAndUpdate(
      application.userId,
      { $set: { accountStatus: 'ACTIVE' } },
      { new: true }
    );

    // Send in-app notification
    await Notification.create({
      recipientId: application.userId,
      title: 'Nutritionist Credentials Approved',
      message: 'Congratulations! Your clinical nutritionist application has been approved by platform administration.',
      type: 'APPLICATION_STATUS',
      relatedResourceId: application._id,
    });

    await AuditLog.create({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'APPROVE_NUTRITIONIST',
      resourceType: 'NutritionistApplication',
      resourceId: application._id.toString(),
      metadata: { nutritionistEmail: user?.email },
    });

    return { application, user };
  }

  static async rejectNutritionist(adminId, applicationId, rejectionReason) {
    const application = await NutritionistApplication.findById(applicationId);
    if (!application) throw new NotFoundError('Nutritionist application not found');

    application.approvalStatus = 'REJECTED';
    application.rejectionReason = rejectionReason || 'Qualifications did not meet current clinical requirements';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    await User.findByIdAndUpdate(application.userId, {
      $set: { accountStatus: 'REJECTED' },
    });

    await Notification.create({
      recipientId: application.userId,
      title: 'Nutritionist Application Update',
      message: `Your application could not be approved at this time: ${application.rejectionReason}`,
      type: 'APPLICATION_STATUS',
      relatedResourceId: application._id,
    });

    await AuditLog.create({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'REJECT_NUTRITIONIST',
      resourceType: 'NutritionistApplication',
      resourceId: application._id.toString(),
      reason: rejectionReason,
    });

    return application;
  }

  /**
   * 4. Client Assignment Workflow
   */
  static async listAssignments() {
    return ClientAssignment.find()
      .populate('userId', 'name email profile.avatar')
      .populate('nutritionistId', 'name email profile.avatar')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
  }

  static async assignClient(adminId, { userId, nutritionistId, notes = '' }) {
    // 1. Verify user exists and has USER role
    const client = await User.findById(userId);
    if (!client || client.role !== 'USER') {
      throw new ValidationError('Invalid client identifier or user is not a dieter');
    }

    // 2. Verify nutritionist exists, has NUTRITIONIST role, and is ACTIVE
    const nutritionist = await User.findById(nutritionistId);
    if (!nutritionist || nutritionist.role !== 'NUTRITIONIST' || nutritionist.accountStatus !== 'ACTIVE') {
      throw new ValidationError('Invalid or inactive nutritionist account');
    }

    // 3. Check for existing active assignment
    const existingActive = await ClientAssignment.findOne({
      userId,
      status: 'ACTIVE',
    });

    if (existingActive) {
      if (existingActive.nutritionistId.toString() === nutritionistId.toString()) {
        throw new ConflictError('This nutritionist is already actively assigned to this client');
      }
      // Terminate previous assignment
      existingActive.status = 'TERMINATED';
      existingActive.unassignedAt = new Date();
      await existingActive.save();
    }

    // 4. Create new assignment
    const assignment = await ClientAssignment.create({
      userId,
      nutritionistId,
      assignedBy: adminId,
      status: 'ACTIVE',
      notes,
    });

    // 5. Mark any pending ClientRequests as ASSIGNED
    await ClientRequest.updateMany(
      { userId, status: 'PENDING' },
      { $set: { status: 'ASSIGNED' } }
    );

    // 6. Notify both Client and Nutritionist
    await Promise.all([
      Notification.create({
        recipientId: userId,
        title: 'Nutritionist Assigned',
        message: `${nutritionist.name} has been assigned as your dedicated clinical nutritionist.`,
        type: 'CLIENT_ASSIGNED',
        relatedResourceId: assignment._id,
      }),
      Notification.create({
        recipientId: nutritionistId,
        title: 'New Client Assigned',
        message: `${client.name} has been assigned to your clinical workspace.`,
        type: 'CLIENT_ASSIGNED',
        relatedResourceId: assignment._id,
      }),
      AuditLog.create({
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'ASSIGN_CLIENT',
        resourceType: 'ClientAssignment',
        resourceId: assignment._id.toString(),
        metadata: { clientEmail: client.email, nutritionistEmail: nutritionist.email },
      }),
    ]);

    return assignment;
  }

  static async unassignClient(adminId, assignmentId, reason = '') {
    const assignment = await ClientAssignment.findById(assignmentId);
    if (!assignment) throw new NotFoundError('Assignment record not found');

    assignment.status = 'TERMINATED';
    assignment.unassignedAt = new Date();
    await assignment.save();

    await AuditLog.create({
      actorId: adminId,
      actorRole: 'ADMIN',
      action: 'UNASSIGN_CLIENT',
      resourceType: 'ClientAssignment',
      resourceId: assignment._id.toString(),
      reason,
    });

    return assignment;
  }

  /**
   * 5. Food Database Management
   */
  static async createFoodItem(adminId, data) {
    const normalizedName = data.name.trim().toLowerCase();

    const existing = await FoodItem.findOne({ normalizedName });
    if (existing) {
      throw new ConflictError(`A food item with name "${data.name}" already exists`);
    }

    const food = await FoodItem.create({
      name: data.name.trim(),
      normalizedName,
      categoryId: data.categoryId || null,
      category: data.category || 'general',
      description: data.description || '',
      imageReference: data.imageReference || '',
      nutrients: data.nutrients, // per 100g
      servingInformation: data.servingInformation || { servingSizeGrams: 100, servingUnit: '100g' },
      source: 'ADMIN_MANUAL',
      verificationStatus: 'VERIFIED',
      createdBy: adminId,
    });

    return food;
  }

  static async updateFoodItem(adminId, foodId, data) {
    const food = await FoodItem.findById(foodId);
    if (!food) throw new NotFoundError('Food item not found');

    if (data.name) {
      food.name = data.name.trim();
      food.normalizedName = data.name.trim().toLowerCase();
    }
    if (data.categoryId) food.categoryId = data.categoryId;
    if (data.category) food.category = data.category;
    if (data.description !== undefined) food.description = data.description;
    if (data.imageReference !== undefined) food.imageReference = data.imageReference;
    if (data.nutrients) food.nutrients = { ...food.nutrients, ...data.nutrients };
    if (data.servingInformation) food.servingInformation = { ...food.servingInformation, ...data.servingInformation };
    if (data.verificationStatus) food.verificationStatus = data.verificationStatus;

    food.updatedBy = adminId;
    await food.save();
    return food;
  }

  static async deleteFoodItem(foodId) {
    const food = await FoodItem.findById(foodId);
    if (!food) throw new NotFoundError('Food item not found');
    await FoodItem.deleteOne({ _id: foodId });
    return { message: 'Food item deleted successfully' };
  }

  /**
   * Import verified food from USDA FoodData Central
   */
  static async importUsdaFood(adminId, usdaFoodItem) {
    const normalizedName = usdaFoodItem.name.trim().toLowerCase();

    let food = await FoodItem.findOne({
      $or: [
        { sourceReference: usdaFoodItem.sourceReference },
        { normalizedName },
      ],
    });

    if (food) {
      // Update existing record
      food.nutrients = usdaFoodItem.nutrients;
      food.verificationStatus = 'VERIFIED';
      food.updatedBy = adminId;
      await food.save();
      return { food, created: false };
    }

    food = await FoodItem.create({
      name: usdaFoodItem.name,
      normalizedName,
      source: 'USDA_FDC',
      sourceReference: usdaFoodItem.sourceReference,
      nutrients: usdaFoodItem.nutrients,
      servingInformation: usdaFoodItem.servingInformation,
      category: usdaFoodItem.category || 'general',
      verificationStatus: 'VERIFIED',
      createdBy: adminId,
    });

    return { food, created: true };
  }

  /**
   * 6. Audit Logs
   */
  static async listAuditLogs({ page = 1, limit = 50 }) {
    const skip = (Math.max(1, page) - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find()
        .populate('actorId', 'name email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(),
    ]);

    return { logs, total, page: Number(page), limit: Number(limit) };
  }
}
