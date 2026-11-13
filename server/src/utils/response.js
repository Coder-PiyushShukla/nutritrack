export function sendSuccess(res, data = {}, message = 'Operation completed successfully', statusCode = 200, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: Object.keys(meta).length > 0 ? meta : undefined,
  });
}

export function sendError(res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    details: details.length > 0 ? details : undefined,
  });
}
