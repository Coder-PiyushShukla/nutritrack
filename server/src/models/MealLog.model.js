import mongoose from 'mongoose';

const LoggedFoodItemSchema = new mongoose.Schema(
  {
    foodItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodItem',
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    portionGrams: {
      type: Number,
      required: true,
      min: 1,
    },
    servingUnit: {
      type: String,
      default: 'g',
    },
    // Immutable Nutritional Snapshot at moment of logging
    nutritionalSnapshot: {
      energyKcal: { type: Number, required: true, default: 0 },
      proteinG: { type: Number, required: true, default: 0 },
      carbohydratesG: { type: Number, required: true, default: 0 },
      totalFatG: { type: Number, required: true, default: 0 },
      fiberG: { type: Number, default: null },
      sugarG: { type: Number, default: null },
      sodiumMg: { type: Number, default: null },
    },
  },
  { _id: true }
);

const MealLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'],
      required: true,
    },
    // Local calendar day in the user's specific timezone (YYYY-MM-DD)
    localDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'localDate must be formatted as YYYY-MM-DD'],
      index: true,
    },
    time: {
      type: String,
      default: () => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      },
    },
    items: {
      type: [LoggedFoodItemSchema],
      default: [],
    },
    nutritionalTotals: {
      energyKcal: { type: Number, default: 0 },
      proteinG: { type: Number, default: 0 },
      carbohydratesG: { type: Number, default: 0 },
      totalFatG: { type: Number, default: 0 },
      fiberG: { type: Number, default: 0 },
      sugarG: { type: Number, default: 0 },
      sodiumMg: { type: Number, default: 0 },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for instant day & range querying
MealLogSchema.index({ userId: 1, localDate: 1 });
MealLogSchema.index({ userId: 1, createdAt: -1 });

export const MealLog = mongoose.model('MealLog', MealLogSchema);
