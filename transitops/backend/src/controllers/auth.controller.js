import * as authService from '../services/auth.service.js';

/**
 * Handle user registration request
 */
export const register = async (req, res, next) => {
  try {
    const { email, username, password, name, role } = req.body;

    const user = await authService.registerUser({
      email,
      username,
      password,
      name,
      roleName: role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle user login request
 */
export const login = async (req, res, next) => {
  try {
    const { loginIdentifier, password } = req.body;

    const result = await authService.loginUser({
      loginIdentifier,
      password
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
