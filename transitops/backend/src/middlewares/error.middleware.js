import ApiError from '../utils/ApiError.js';

/**
 * Global Express Error Handling Middleware.
 * Responds with standard JSON structure: { success: false, message, errors }
 * Also supports formatting specific errorCode values (e.g., DUPLICATE_REG_NUMBER).
 */
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message, errors, errorCode } = err;

  // If it's a generic Error without status code, treat it as 500 Internal Server Error
  if (!statusCode) {
    statusCode = 500;
    message = message || 'Internal Server Error';
    errors = [];
  }

  // Log error stacks in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error Handler] Stack: ${err.stack || err}`);
  } else {
    console.error(`[Error Handler] Message: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors || [],
    ...(errorCode && { errorCode })
  });
};

/**
 * Route Not Found (404) Handler.
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};
