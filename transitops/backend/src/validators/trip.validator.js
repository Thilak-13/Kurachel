import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware.js';

/**
 * Validator rules for creating a Trip.
 */
export const tripValidator = [
  body('vehicleId')
    .trim()
    .notEmpty().withMessage('Vehicle ID is required')
    .isUUID().withMessage('Vehicle ID must be a valid UUID'),

  body('driverId')
    .trim()
    .notEmpty().withMessage('Driver ID is required')
    .isUUID().withMessage('Driver ID must be a valid UUID'),

  body('source')
    .optional()
    .trim()
    .notEmpty().withMessage('Source location cannot be empty'),

  body('startLocation')
    .optional()
    .trim()
    .notEmpty().withMessage('Start location cannot be empty'),

  body('destination')
    .optional()
    .trim()
    .notEmpty().withMessage('Destination location cannot be empty'),

  body('endLocation')
    .optional()
    .trim()
    .notEmpty().withMessage('End location cannot be empty'),

  body('cargoWeight')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Cargo weight must be a positive number'),

  body('plannedDistance')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Planned distance must be a positive number'),

  validateRequest
];

/**
 * Validator rules for completing a Trip.
 */
export const tripCompleteValidator = [
  body('finalOdometer')
    .notEmpty().withMessage('Final odometer reading is required')
    .isFloat({ min: 0 }).withMessage('Final odometer must be a non-negative number'),

  body('fuelConsumed')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Fuel consumed must be a non-negative number'),

  validateRequest
];
