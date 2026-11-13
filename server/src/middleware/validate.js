import { ValidationError } from '../utils/errors.js';

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const toValidate = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const parsed = schema.safeParse(toValidate);

      if (!parsed.success) {
        const details = parsed.error.issues.map((issue) => ({
          field: issue.path.join('.').replace(/^(body|query|params)\.?/, ''),
          location: issue.path[0] || 'body',
          message: issue.message,
        }));
        return next(new ValidationError('Request validation failed', details));
      }

      // Reassign validated & sanitized data
      if (parsed.data.body) req.body = parsed.data.body;
      if (parsed.data.query) req.query = parsed.data.query;
      if (parsed.data.params) req.params = parsed.data.params;

      next();
    } catch (err) {
      next(err);
    }
  };
}
