// Maintenance validation rules - Stub Signatures for Block 1
const { VehicleStatus } = require('../enums');

/**
 * Checks if maintenance can be opened for a vehicle.
 * @param {Object} vehicle 
 * @returns {boolean}
 */
function canOpenMaintenance(vehicle) {
  return true;
}

/**
 * Checks if maintenance can be closed for a vehicle.
 * @param {Object} vehicle 
 * @returns {boolean}
 */
function canCloseMaintenance(vehicle) {
  if (!vehicle) return false;
  return vehicle.status !== 'Retired' && vehicle.status !== 'DECOMMISSIONED';
}

module.exports = {
  canOpenMaintenance,
  canCloseMaintenance,
};
