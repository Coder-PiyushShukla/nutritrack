import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Never return in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: ['USER', 'NUTRITIONIST', 'ADMIN'],
      default: 'USER',
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ['PENDING_EMAIL', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'SUSPENDED', 'DELETED'],
      default: 'PENDING_EMAIL',
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    profile: {
      avatar: { type: String, default: '' },
      bio: { type: String, default: '', maxlength: 500 },
      age: { type: Number, min: 10, max: 120, default: null },
      gender: { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say', ''], default: '' },
      heightCm: { type: Number, min: 50, max: 280, default: null },
      currentWeightKg: { type: Number, min: 20, max: 500, default: null },
      targetWeightKg: { type: Number, min: 20, max: 500, default: null },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very-active', ''],
        default: 'moderate',
      },
    },
    dietaryPreferences: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    nutritionGoals: {
      dailyCalorieTarget: { type: Number, default: 2000, min: 500, max: 10000 },
      dailyProteinG: { type: Number, default: 120, min: 0, max: 1000 },
      dailyCarbsG: { type: Number, default: 220, min: 0, max: 2000 },
      dailyFatG: { type: Number, default: 65, min: 0, max: 1000 },
      dailyWaterMl: { type: Number, default: 2500, min: 500, max: 15000 },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

UserSchema.index({ role: 1, accountStatus: 1 });

export const User = mongoose.model('User', UserSchema);
