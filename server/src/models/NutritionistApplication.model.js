import mongoose from 'mongoose';

const NutritionistApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    qualification: {
      type: String,
      required: [true, 'Professional qualification is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience years must be positive'],
    },
    professionalDescription: {
      type: String,
      required: [true, 'Professional description is required'],
      trim: true,
    },
    credentialReferences: {
      type: [String],
      default: [],
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

NutritionistApplicationSchema.index({ approvalStatus: 1, createdAt: -1 });

export const NutritionistApplication = mongoose.model(
  'NutritionistApplication',
  NutritionistApplicationSchema
);
