// Maintenance validation rules - Stub Signatures for Block 1
const { VehicleStatus } = require('../enums');

/**
 * Checks if maintenance can be opened for a vehicle.
 * @param {Object} vehicle 
 * @returns {boolean}
 */
function canOpenMaintenance(vehicle) {
  // Stub body - to be implemented in Block 2/3
  return true;
}

/**
 * Checks if maintenance can be closed for a vehicle.
 * @param {Object} vehicle 
 * @returns {boolean}
 */
function canCloseMaintenance(vehicle) {
  // Stub body - to be implemented in Block 2/3
  // NOTE: This function must eventually respect a "Retired vehicles stay Retired" guard.
  // If vehicle.status === VehicleStatus.RETIRED (or 'Retired'), it should remain Retired.
  return true;
}

module.exports = {
  canOpenMaintenance,
  canCloseMaintenance,
};
