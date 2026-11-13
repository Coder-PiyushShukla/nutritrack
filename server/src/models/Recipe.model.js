import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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
    category: {
      type: String,
      default: 'general',
      index: true,
    },
    ingredients: [
      {
        foodItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'FoodItem',
          required: false,
        },
        name: { type: String, required: true },
        quantityGrams: { type: Number, required: true, min: 1 },
        unit: { type: String, default: 'g' },
      },
    ],
    preparationSteps: {
      type: [String],
      default: [],
    },
    servings: {
      type: Number,
      default: 1,
      min: 1,
    },
    preparationTimeMinutes: {
      type: Number,
      default: 15,
      min: 1,
    },
    nutritionInformation: {
      energyKcal: { type: Number, default: null },
      proteinG: { type: Number, default: null },
      carbohydratesG: { type: Number, default: null },
      totalFatG: { type: Number, default: null },
      fiberG: { type: Number, default: null },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
  },
  { timestamps: true }
);

export const Recipe = mongoose.model('Recipe', RecipeSchema);
