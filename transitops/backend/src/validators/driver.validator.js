import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware.js';

/**
 * Validator rules for creating or updating a Driver.
 * Required fields are only enforced during creation (POST).
 */
export const driverValidator = [
  body('name')
    .if((value, { req }) => req.method === 'POST')
    .trim()
    .notEmpty().withMessage('Driver name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Driver name must be between 2 and 50 characters'),

  body('licenseNumber')
    .if((value, { req }) => req.method === 'POST')
    .trim()
    .notEmpty().withMessage('License number is required')
    .matches(/^[A-Z]{2}\d{2}\s?\d{11}$/).withMessage('License number must use the format DL14 20180098765'),

  body('licenseExpiryDate')
    .if((value, { req }) => req.method === 'POST')
    .trim()
    .notEmpty().withMessage('License expiry date is required')
    .isISO8601().withMessage('License expiry date must be a valid ISO 8601 date (YYYY-MM-DD)'),

  body('contact')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+91-?\d{10}$/).withMessage('Contact/phone number must use the format +91-9876543210'),

  body('category')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty().withMessage('Category cannot be empty if provided'),

  body('safetyScore')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 100 }).withMessage('Safety score must be an integer between 0 and 100'),

  body('status')
    .optional()
    .trim()
    .isIn(['Available', 'On Trip', 'Suspended', 'Off Duty'])
    .withMessage('Status must be one of: Available, On Trip, Suspended, Off Duty'),

  validateRequest
];
