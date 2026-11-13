import mongoose from 'mongoose';

// Email Verification Token
const EmailVerificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto delete after expiry (TTL 24 hours)
    },
  },
  { timestamps: true }
);

export const EmailVerificationToken = mongoose.model(
  'EmailVerificationToken',
  EmailVerificationTokenSchema
);

// Password Reset Token
const PasswordResetTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto delete after expiry (TTL 1 hour)
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const PasswordResetToken = mongoose.model(
  'PasswordResetToken',
  PasswordResetTokenSchema
);
