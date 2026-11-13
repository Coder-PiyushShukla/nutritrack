import mongoose from 'mongoose';

const WaterLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amountMl: {
      type: Number,
      required: true,
      min: [1, 'Water amount must be at least 1 ml'],
      max: [10000, 'Water amount cannot exceed 10000 ml per log'],
    },
    localDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'localDate must be formatted as YYYY-MM-DD'],
      index: true,
    },
    loggedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

WaterLogSchema.index({ userId: 1, localDate: 1 });

export const WaterLog = mongoose.model('WaterLog', WaterLogSchema);
