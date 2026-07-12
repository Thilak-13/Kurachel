import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware.js';

/**
 * Validation rules for creating or updating a Fuel Log.
 */
export const fuelValidator = [
  body('vehicleId')
    .trim()
    .notEmpty().withMessage('Vehicle ID is required')
    .isUUID().withMessage('Vehicle ID must be a valid UUID'),

  body('liters')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.1 }).withMessage('Liters (volume) must be a positive number'),

  body('fuelVolume')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.1 }).withMessage('Fuel volume must be a positive number'),

  body('cost')
    .notEmpty().withMessage('Cost is required')
    .isFloat({ min: 0 }).withMessage('Cost must be a positive number'),

  body('odometer')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Odometer reading must be a positive number'),

  body('odometerReading')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Odometer reading must be a positive number'),

  body('date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),

  body('loggedAt')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Logged at timestamp must be a valid ISO 8601 date'),

  validateRequest
];
