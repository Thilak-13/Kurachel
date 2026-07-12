import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware.js';

/**
 * Validator rules for creating or updating a Vehicle.
 * Enforces strict format for registration number.
 */
export const vehicleValidator = [
  body('registrationNumber')
    .if((value, { req }) => req.method === 'POST')
    .trim()
    .notEmpty().withMessage('Registration number is required'),

  body('registrationNumber')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Registration number must be between 3 and 20 characters')
    .matches(/^[A-Z]{2}-\d{1,2}[A-Z]{0,2}-[A-Z]{1,2}-\d{4}$/)
    .withMessage('Registration number must match Indian format, e.g. MH-12-AB-3456'),

  body('model')
    .if((value, { req }) => req.method === 'POST')
    .trim()
    .notEmpty().withMessage('Model is required'),

  body('type')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty().withMessage('Vehicle type cannot be empty if provided'),

  body('maxLoadCapacity')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 }).withMessage('Max load capacity must be a positive integer'),

  body('odometer')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Odometer reading must be a non-negative number'),

  body('acquisitionCost')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Acquisition cost must be a non-negative number'),

  body('status')
    .optional()
    .trim()
    .isIn(['Available', 'On Trip', 'In Shop', 'Retired'])
    .withMessage('Status must be one of: Available, On Trip, In Shop, Retired'),

  validateRequest
];
