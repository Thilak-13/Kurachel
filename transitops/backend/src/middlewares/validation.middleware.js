import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Express middleware to validate express-validator results.
 * If validation fails, calls next() with an ApiError containing the field details and VALIDATION_ERROR code.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    return next(new ApiError(400, 'Validation failed', formattedErrors, 'VALIDATION_ERROR'));
  }
  next();
};
