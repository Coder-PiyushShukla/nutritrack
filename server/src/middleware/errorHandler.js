import { AppError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { isProduction } from '../config/env.js';

export function centralizedErrorHandler(err, req, res, next) {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. Known AppError instances
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode, err.details);
  }

  // 2. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 'Database validation failed', 400, 'VALIDATION_ERROR', details);
  }

  // 3. Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(
      res,
      `Invalid format for resource identifier '${err.path}'`,
      400,
      'INVALID_ID',
      [{ field: err.path, value: err.value }]
    );
  }

  // 4. Mongo Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(
      res,
      `A record with this ${field} already exists`,
      409,
      'DUPLICATE_KEY_ERROR',
      [{ field, value: err.keyValue ? err.keyValue[field] : undefined }]
    );
  }

  // 5. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired', 401, 'TOKEN_EXPIRED');
  }

  // 6. Generic Unexpected Errors
  if (!isProduction) {
    console.error('💥 Unhandled Exception:', err);
  } else {
    console.error('💥 Internal Server Error:', err.message);
  }

  const message = isProduction
    ? 'An unexpected internal server error occurred'
    : err.message || 'Internal Server Error';

  return sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
}
