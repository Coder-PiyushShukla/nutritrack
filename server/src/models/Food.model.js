import mongoose from 'mongoose';

// Food Category
const FoodCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const FoodCategory = mongoose.model('FoodCategory', FoodCategorySchema);

// Food Item (Standardized to 100g measurement basis)
const FoodItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
      index: true,
    },
    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodCategory',
      default: null,
      index: true,
    },
    category: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'pantry', 'general'],
      default: 'general',
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    imageReference: {
      type: String,
      default: '',
    },
    // Standard Basis: Strictly Per 100 Grams
    nutrients: {
      energyKcal: { type: Number, required: true, min: 0 },
      proteinG: { type: Number, default: 0, min: 0 },
      carbohydratesG: { type: Number, default: 0, min: 0 },
      totalFatG: { type: Number, default: 0, min: 0 },
      fiberG: { type: Number, default: null, min: 0 },
      sugarG: { type: Number, default: null, min: 0 },
      sodiumMg: { type: Number, default: null, min: 0 },
    },
    servingInformation: {
      servingSizeGrams: { type: Number, default: 100, min: 1 },
      servingUnit: { type: String, default: '100g' },
      householdMeasure: { type: String, default: '1 serving' },
    },
    source: {
      type: String,
      enum: ['USDA_FDC', 'ADMIN_MANUAL', 'VERIFIED_PARTNER'],
      required: true,
    },
    sourceReference: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'],
      default: 'PENDING_VERIFICATION',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

FoodItemSchema.index({ name: 'text', normalizedName: 'text', description: 'text' });
FoodItemSchema.index({ verificationStatus: 1, category: 1 });

export const FoodItem = mongoose.model('FoodItem', FoodItemSchema);
