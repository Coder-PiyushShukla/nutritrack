import mongoose from 'mongoose';

// Progress Record (Body Weight & Daily User Metrics)
const ProgressRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    localDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'localDate must be formatted as YYYY-MM-DD'],
      index: true,
    },
    weightKg: {
      type: Number,
      min: [20, 'Weight must be at least 20 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

ProgressRecordSchema.index({ userId: 1, localDate: 1 }, { unique: true });

export const ProgressRecord = mongoose.model('ProgressRecord', ProgressRecordSchema);

// Persistent In-App Notification
const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'DIET_PLAN_ASSIGNED',
        'DIET_PLAN_UPDATED',
        'CLIENT_ASSIGNED',
        'NUTRITIONIST_REQUEST',
        'APPLICATION_STATUS',
        'ACCOUNT',
        'GENERAL',
      ],
      required: true,
      index: true,
    },
    relatedResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);

// Security & Administrative Audit Log
const AuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
    requestId: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

AuditLogSchema.index({ action: 1, timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
