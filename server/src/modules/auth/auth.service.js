import { User } from '../../models/User.model.js';
import { RefreshSession } from '../../models/RefreshSession.model.js';
import { EmailVerificationToken, PasswordResetToken } from '../../models/Tokens.model.js';
import { NutritionistApplication } from '../../models/NutritionistApplication.model.js';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  generateAccessToken,
} from '../../utils/security.js';
import {
  AuthenticationError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../utils/errors.js';
import { emailService } from '../../services/email/email.service.js';
import { env } from '../../config/env.js';

export class AuthService {
  /**
   * 1. Register a normal user (Strictly sets role = 'USER')
   */
  static async registerUser(data) {
    const email = data.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await User.create({
      name: data.name.trim(),
      email,
      passwordHash,
      role: 'USER', // Enforced server-side
      accountStatus: 'PENDING_EMAIL',
      profile: data.profile || {},
      dietaryPreferences: data.dietaryPreferences || [],
      allergies: data.allergies || [],
      nutritionGoals: data.nutritionGoals || undefined,
      timezone: data.timezone || 'UTC',
    });

    // Generate secure email verification token
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);

    await EmailVerificationToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, rawToken);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * 2. Apply as a Nutritionist (Requires admin approval)
   */
  static async applyNutritionist(data) {
    const email = data.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await User.create({
      name: data.name.trim(),
      email,
      passwordHash,
      role: 'NUTRITIONIST', // Enforced server-side
      accountStatus: 'PENDING_APPROVAL',
      profile: { bio: data.professionalDescription },
    });

    await NutritionistApplication.create({
      userId: user._id,
      qualification: data.qualification,
      specialization: data.specialization,
      experienceYears: data.experienceYears,
      professionalDescription: data.professionalDescription,
      credentialReferences: data.credentialReferences || [],
      approvalStatus: 'PENDING',
    });

    // Generate email verification
    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);

    await EmailVerificationToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await emailService.sendVerificationEmail(user.email, rawToken);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      },
      message: 'Application submitted. Your credentials are now pending administrative review.',
    };
  }

  /**
   * 3. Verify Email Address
   */
  static async verifyEmail(token, email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new NotFoundError('Invalid email verification link');
    }

    const tokenHash = hashToken(token);
    const storedToken = await EmailVerificationToken.findOne({
      userId: user._id,
      tokenHash,
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new ValidationError('Verification token is invalid or has expired');
    }

    // Activate user account (or keep PENDING_APPROVAL if nutritionist)
    if (user.role === 'USER') {
      user.accountStatus = 'ACTIVE';
    }
    user.emailVerifiedAt = new Date();
    await user.save();

    await EmailVerificationToken.deleteOne({ _id: storedToken._id });

    return {
      message: 'Email verified successfully. You may now sign in to your sanctuary.',
    };
  }

  /**
   * 4. Login (Strict credential & account status checks)
   */
  static async login(email, password, userAgent = '', ipAddress = '') {
    const normalizedEmail = email.toLowerCase().trim();

    // Query user including passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    // Generic error to prevent account enumeration
    if (!user) {
      throw new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isMatch = await verifyPassword(user.passwordHash, password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.accountStatus === 'SUSPENDED' || user.accountStatus === 'DELETED') {
      throw new ForbiddenError('Your account has been deactivated. Please contact support.', 'ACCOUNT_DEACTIVATED');
    }

    if (user.accountStatus === 'PENDING_APPROVAL') {
      throw new ForbiddenError(
        'Your nutritionist application is currently undergoing review by our clinical administration.',
        'PENDING_APPROVAL'
      );
    }

    // Create a new Refresh Session
    const sessionId = generateSecureToken(16);
    const rawRefreshToken = generateSecureToken(32);
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    await RefreshSession.create({
      userId: user._id,
      sessionId,
      tokenHash,
      tokenFamily: sessionId,
      userAgent,
      ipAddress,
      expiresAt,
    });

    // Issue short-lived JWT access token
    const accessToken = generateAccessToken(user, sessionId);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        profile: user.profile,
        dietaryPreferences: user.dietaryPreferences,
        nutritionGoals: user.nutritionGoals,
        timezone: user.timezone,
      },
      accessToken,
      refreshToken: rawRefreshToken,
      sessionId,
    };
  }

  /**
   * 5. Rotate Refresh Token & Session Management
   */
  static async refreshSession(rawRefreshToken, userAgent = '', ipAddress = '') {
    if (!rawRefreshToken) {
      throw new AuthenticationError('Refresh token required');
    }

    const tokenHash = hashToken(rawRefreshToken);

    // Find the session
    const session = await RefreshSession.findOne({ tokenHash });

    // REUSE DETECTION: If token was already revoked or not found
    if (!session) {
      throw new AuthenticationError('Invalid or expired session', 'INVALID_SESSION');
    }

    if (session.revokedAt) {
      // Possible token theft! Revoke all sessions in this family
      await RefreshSession.updateMany(
        { tokenFamily: session.tokenFamily },
        { revokedAt: new Date() }
      );
      throw new AuthenticationError('Compromised session detected. All sessions revoked.', 'TOKEN_REUSE_DETECTED');
    }

    if (session.expiresAt < new Date()) {
      session.revokedAt = new Date();
      await session.save();
      throw new AuthenticationError('Session expired. Please log in again.', 'SESSION_EXPIRED');
    }

    const user = await User.findById(session.userId);
    if (!user || user.accountStatus === 'SUSPENDED' || user.accountStatus === 'DELETED') {
      session.revokedAt = new Date();
      await session.save();
      throw new ForbiddenError('Account is not active');
    }

    // Token Rotation: Generate new refresh token for this session
    const newRawRefreshToken = generateSecureToken(32);
    const newTokenHash = hashToken(newRawRefreshToken);

    session.tokenHash = newTokenHash;
    session.lastUsedAt = new Date();
    session.userAgent = userAgent || session.userAgent;
    session.ipAddress = ipAddress || session.ipAddress;
    await session.save();

    const accessToken = generateAccessToken(user, session.sessionId);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        profile: user.profile,
        dietaryPreferences: user.dietaryPreferences,
        nutritionGoals: user.nutritionGoals,
        timezone: user.timezone,
      },
      accessToken,
      refreshToken: newRawRefreshToken,
      sessionId: session.sessionId,
    };
  }

  /**
   * 6. Logout single session
   */
  static async logout(sessionId) {
    if (sessionId) {
      await RefreshSession.updateOne(
        { sessionId, revokedAt: null },
        { revokedAt: new Date() }
      );
    }
    return { message: 'Logged out successfully' };
  }

  /**
   * 7. Logout from all devices
   */
  static async logoutAll(userId) {
    await RefreshSession.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );
    return { message: 'All active sessions have been safely terminated' };
  }

  /**
   * 8. Forgot Password Request
   */
  static async forgotPassword(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return { message: 'If an account matches that email, a password reset link has been dispatched.' };
    }

    // Invalidate existing unused reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    const rawToken = generateSecureToken(32);
    const tokenHash = hashToken(rawToken);

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    await emailService.sendPasswordResetEmail(user.email, rawToken);

    return { message: 'If an account matches that email, a password reset link has been dispatched.' };
  }

  /**
   * 9. Reset Password with Token
   */
  static async resetPassword(token, email, newPassword) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new ValidationError('Invalid or expired password reset link');
    }

    const tokenHash = hashToken(token);
    const resetToken = await PasswordResetToken.findOne({
      userId: user._id,
      tokenHash,
      usedAt: null,
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new ValidationError('Password reset link is invalid or has expired');
    }

    // Hash and update password
    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Mark token as used
    resetToken.usedAt = new Date();
    await resetToken.save();

    // Security: Revoke all existing refresh sessions
    await RefreshSession.updateMany({ userId: user._id }, { revokedAt: new Date() });

    return { message: 'Password reset successfully. You may now sign in with your new credentials.' };
  }

  /**
   * 10. Change Password (Authenticated)
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await verifyPassword(user.passwordHash, currentPassword);
    if (!isMatch) {
      throw new ValidationError('Current password entered is incorrect');
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Revoke all sessions except current one or revoke all
    await RefreshSession.updateMany({ userId }, { revokedAt: new Date() });

    return { message: 'Password updated successfully. Please log in with your new password.' };
  }
}
