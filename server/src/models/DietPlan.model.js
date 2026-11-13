import mongoose from 'mongoose';

const DietPlanSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    nutritionistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: [true, 'Diet plan name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    durationDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 365,
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    dailyTargets: {
      calorieTarget: { type: Number, required: true },
      proteinG: { type: Number, required: true },
      carbsG: { type: Number, required: true },
      fatG: { type: Number, required: true },
      waterMl: { type: Number, default: 2500 },
    },
    weeklySchedule: [
      {
        dayOfWeek: {
          type: String,
          enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
          required: true,
        },
        meals: [
          {
            mealType: {
              type: String,
              enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'],
              required: true,
            },
            suggestedItems: { type: [String], default: [] },
            notes: { type: String, default: '' },
            targetCalories: { type: Number, default: 0 },
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
    revision: {
      type: Number,
      default: 1,
    },
    revisionHistory: [
      {
        revisionNumber: { type: Number, required: true },
        modifiedAt: { type: Date, default: Date.now },
        modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changeSummary: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

DietPlanSchema.index({ clientId: 1, status: 1 });
DietPlanSchema.index({ nutritionistId: 1, status: 1 });

export const DietPlan = mongoose.model('DietPlan', DietPlanSchema);
