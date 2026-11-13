import { verifyAccessToken } from '../utils/security.js';
import { User } from '../models/User.model.js';
import { RefreshSession } from '../models/RefreshSession.model.js';
import { ClientAssignment } from '../models/ClientAssignment.model.js';
import { AuthenticationError, ForbiddenError, NotFoundError } from '../utils/errors.js';

/**
 * Verifies Bearer JWT Access Token and binds req.user & req.sessionId
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Authentication token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AuthenticationError('Access token expired', 'TOKEN_EXPIRED');
      }
      throw new AuthenticationError('Invalid authentication token', 'INVALID_TOKEN');
    }

    // Verify session has not been revoked
    const session = await RefreshSession.findOne({
      sessionId: decoded.sessionId,
      revokedAt: null,
    });

    if (!session) {
      throw new AuthenticationError('Session expired or revoked', 'SESSION_REVOKED');
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AuthenticationError('User account no longer exists');
    }

    if (user.accountStatus === 'SUSPENDED' || user.accountStatus === 'DELETED') {
      throw new ForbiddenError('Your account has been suspended or deactivated');
    }

    req.user = user;
    req.sessionId = decoded.sessionId;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role-Based Access Control Middleware
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access restricted: Requires one of [${allowedRoles.join(', ')}] role`
        )
      );
    }

    next();
  };
}

/**
 * Requires verified email address
 */
export function requireVerifiedEmail(req, res, next) {
  if (!req.user) {
    return next(new AuthenticationError());
  }

  if (req.user.accountStatus === 'PENDING_EMAIL' || !req.user.emailVerifiedAt) {
    return next(new ForbiddenError('Please verify your email address to continue', 'EMAIL_NOT_VERIFIED'));
  }

  next();
}

/**
 * Requires approved nutritionist status
 */
export function requireApprovedNutritionist(req, res, next) {
  if (!req.user) {
    return next(new AuthenticationError());
  }

  if (req.user.role !== 'NUTRITIONIST') {
    return next(new ForbiddenError('Requires nutritionist account'));
  }

  if (req.user.accountStatus !== 'ACTIVE') {
    return next(new ForbiddenError('Your nutritionist credentials are under review by administration', 'NUTRITIONIST_PENDING_APPROVAL'));
  }

  next();
}

/**
 * Verifies that the client is actively assigned to the nutritionist (Anti-IDOR protection)
 */
export function requireClientAssignment(req, res, next) {
  return async (req, res, next) => {
    try {
      const clientId = req.params.clientId || req.body.clientId;
      if (!clientId) {
        return next(new NotFoundError('Client identifier required'));
      }

      // Check active assignment
      const assignment = await ClientAssignment.findOne({
        nutritionistId: req.user._id,
        userId: clientId,
        status: 'ACTIVE',
      });

      if (!assignment) {
        return next(new ForbiddenError('You do not have an active assignment for this client'));
      }

      req.assignment = assignment;
      next();
    } catch (err) {
      next(err);
    }
  };
}
