import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import { isProduction, env } from '../../config/env.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
};

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.registerUser(req.body);
      return sendSuccess(res, result.user, result.message, 201);
    } catch (err) {
      next(err);
    }
  }

  static async applyNutritionist(req, res, next) {
    try {
      const result = await AuthService.applyNutritionist(req.body);
      return sendSuccess(res, result.user, result.message, 201);
    } catch (err) {
      next(err);
    }
  }

  static async verifyEmail(req, res, next) {
    try {
      const { token, email } = req.query;
      const result = await AuthService.verifyEmail(token, email);
      return sendSuccess(res, {}, result.message, 200);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';

      const { user, accessToken, refreshToken, sessionId } = await AuthService.login(
        email,
        password,
        userAgent,
        ipAddress
      );

      // Set HttpOnly refresh token cookie
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        { user, accessToken, sessionId },
        'Signed in successfully',
        200
      );
    } catch (err) {
      next(err);
    }
  }

  static async refresh(req, res, next) {
    try {
      const rawRefreshToken = req.cookies.refreshToken;
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';

      const { user, accessToken, refreshToken } = await AuthService.refreshSession(
        rawRefreshToken,
        userAgent,
        ipAddress
      );

      // Rotate cookie
      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

      return sendSuccess(
        res,
        { user, accessToken },
        'Token refreshed successfully',
        200
      );
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      await AuthService.logout(req.sessionId);
      res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
      return sendSuccess(res, {}, 'Logged out successfully', 200);
    } catch (err) {
      next(err);
    }
  }

  static async logoutAll(req, res, next) {
    try {
      await AuthService.logoutAll(req.user._id);
      res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
      return sendSuccess(res, {}, 'Terminated all active sessions', 200);
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      return sendSuccess(res, req.user, 'Current session retrieved', 200);
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      return sendSuccess(res, {}, result.message, 200);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { token, email, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, email, newPassword);
      return sendSuccess(res, {}, result.message, 200);
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user._id, currentPassword, newPassword);
      res.clearCookie('refreshToken', { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });
      return sendSuccess(res, {}, result.message, 200);
    } catch (err) {
      next(err);
    }
  }
}
