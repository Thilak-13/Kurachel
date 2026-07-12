// Maintenance validation rules

/**
 * Validates whether maintenance can be scheduled for a vehicle.
 * @param {Object} vehicle - Vehicle object
 * @param {Array<Object>} activeTrips - List of active trips for the vehicle
 * @returns {Object} { isValid: boolean, error?: string }
 */
function validateMaintenance(vehicle, activeTrips) {
  if (!vehicle) {
    return { isValid: false, error: 'Vehicle does not exist.' };
  }
  if (activeTrips && activeTrips.length > 0) {
    return { isValid: false, error: 'Cannot schedule maintenance for a vehicle currently on an active trip.' };
  }
  return { isValid: true };
}

module.exports = {
  validateMaintenance,
};
