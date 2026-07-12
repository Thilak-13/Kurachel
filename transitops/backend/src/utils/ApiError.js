/**
 * Custom API Error class to handle HTTP errors consistently.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Detailed validation or field-specific errors
   * @param {string} errorCode - Custom error string code for test runner compatibility
   * @param {string} stack - Error stack trace
   */
  constructor(statusCode, message, errors = [], errorCode = '', stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
