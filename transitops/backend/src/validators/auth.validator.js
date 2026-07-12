import { body, validationResult } from 'express-validator';

// Middleware to handle express-validator formatting and responses
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Registration validation rules
export const registerValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters long'),

  body('role')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ADMIN', 'DISPATCHER', 'DRIVER', 'MAINTENANCE_STAFF'])
    .withMessage('Role must be one of: ADMIN, DISPATCHER, DRIVER, MAINTENANCE_STAFF'),

  handleValidationErrors
];

// Login validation rules
export const loginValidator = [
  body('loginIdentifier')
    .trim()
    .notEmpty().withMessage('Email or Username is required'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors
];
