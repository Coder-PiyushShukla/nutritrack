import mongoose from 'mongoose';

const ClientAssignmentSchema = new mongoose.Schema(
  {
    userId: {
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
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
      default: 'ACTIVE',
      index: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    unassignedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound indexes to query active assignments efficiently
ClientAssignmentSchema.index({ userId: 1, status: 1 });
ClientAssignmentSchema.index({ nutritionistId: 1, status: 1 });

export const ClientAssignment = mongoose.model('ClientAssignment', ClientAssignmentSchema);

const ClientRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ASSIGNED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    dietaryGoal: {
      type: String,
      default: '',
    },
    preferredSpecialization: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

ClientRequestSchema.index({ userId: 1, status: 1 });

export const ClientRequest = mongoose.model('ClientRequest', ClientRequestSchema);
