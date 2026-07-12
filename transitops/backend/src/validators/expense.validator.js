import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware.js';

/**
 * Validation rules for creating or updating an Expense.
 */
export const expenseValidator = [
  body()
    .custom((value) => {
      if (!value.vehicleId && !value.tripId) {
        throw new Error('Either vehicleId or tripId must be provided');
      }
      return true;
    }),

  body('vehicleId')
    .optional({ checkFalsy: true })
    .isUUID().withMessage('Vehicle ID must be a valid UUID'),

  body('tripId')
    .optional({ checkFalsy: true })
    .isUUID().withMessage('Trip ID must be a valid UUID'),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),

  body('amount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),

  body('cost')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0.01 }).withMessage('Cost must be a positive number'),

  body('date')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),

  body('spentAt')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Spent at must be a valid ISO 8601 date'),

  validateRequest
];
