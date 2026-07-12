import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { verifyToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Registration Endpoint
router.post('/register', registerValidator, authController.register);

// Login Endpoint
router.post('/login', loginValidator, authController.login);

// Protected profile endpoint (for testing verifyToken)
router.get('/profile', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: req.user
    }
  });
});

// Admin-only protected endpoint (for testing authorizeRole)
router.get('/admin-only', verifyToken, authorizeRole('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin! You have accessed this admin-only resource successfully.'
  });
});

export default router;
