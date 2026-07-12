import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware.js';

/**
 * Validator rules for creating or updating a Driver.
 * Enforces strict format for license number and contact phone number.
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
    .notEmpty().withMessage('License number is required'),

  body('licenseNumber')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5, max: 25 }).withMessage('License number must be between 5 and 25 characters')
    .matches(/^[A-Z]{2}\d{2}\s?\d{11}$/)
    .withMessage('License number must match Indian DL format, e.g. DL14 20180098765'),

  body('licenseExpiryDate')
    .if((value, { req }) => req.method === 'POST')
    .trim()
    .notEmpty().withMessage('License expiry date is required')
    .isISO8601().withMessage('License expiry date must be a valid ISO 8601 date (YYYY-MM-DD)'),

  body('contact')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Contact number must be between 10 and 15 digits')
    .matches(/^\+91-?\d{10}$/)
    .withMessage('Contact must be in +91-XXXXXXXXXX format'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits')
    .matches(/^\+91-?\d{10}$/)
    .withMessage('Phone must be in +91-XXXXXXXXXX format'),

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
