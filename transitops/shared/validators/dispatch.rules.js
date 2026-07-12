// Dispatch validation rules
const { VehicleStatus, DriverStatus } = require('../enums');

/**
 * Validates whether a trip can be dispatched.
 * @param {Object} vehicle - Vehicle object
 * @param {Object} driver - Driver object
 * @returns {Object} { isValid: boolean, error?: string }
 */
function validateDispatch(vehicle, driver) {
  if (!vehicle || vehicle.status !== VehicleStatus.ACTIVE) {
    return { isValid: false, error: 'Vehicle must be ACTIVE to be dispatched.' };
  }
  if (!driver || driver.status !== DriverStatus.ACTIVE) {
    return { isValid: false, error: 'Driver must be ACTIVE to be dispatched.' };
  }
  return { isValid: true };
}

module.exports = {
  validateDispatch,
};
