// Dispatch validation rules - Stub Signatures for Block 1
const { VehicleStatus, DriverStatus } = require('../enums');

/**
 * Checks if a vehicle's registration number is unique.
 * @param {string} regNo 
 * @returns {Promise<boolean>}
 */
async function isRegNumberUnique(regNo) {
  // Stub body - to be implemented in Block 2/3
  return true;
}

/**
 * Validates whether a value is a valid enum status for a given entity type.
 * @param {'vehicle' | 'driver' | 'trip'} entity 
 * @param {string} value 
 * @returns {boolean}
 */
function isValidStatusEnum(entity, value) {
  // Stub body - to be implemented in Block 2/3
  return true;
}

/**
 * Checks if a vehicle status is 'Available' and eligible for dispatch.
 * @param {Object} vehicle 
 * @returns {boolean}
 */
function isVehicleAvailableForDispatch(vehicle) {
  // Stub body - to be implemented in Block 2/3
  return true;
}

/**
 * Checks if a driver status is 'Available' and eligible for dispatch.
 * @param {Object} driver 
 * @returns {boolean}
 */
function isDriverAvailableForDispatch(driver) {
  // Stub body - to be implemented in Block 2/3
  return true;
}

/**
 * Checks if a driver's license is valid and not expired or suspended.
 * @param {Object} driver 
 * @returns {boolean}
 */
function isLicenseValid(driver) {
  // Stub body - to be implemented in Block 2/3
  return true;
}

/**
 * Checks if the cargo weight does not exceed the vehicle's max load capacity.
 * @param {number} cargoWeight 
 * @param {Object} vehicle 
 * @returns {boolean}
 */
function isCargoWithinCapacity(cargoWeight, vehicle) {
  // Stub body - to be implemented in Block 2/3
  return true;
}

module.exports = {
  isRegNumberUnique,
  isValidStatusEnum,
  isVehicleAvailableForDispatch,
  isDriverAvailableForDispatch,
  isLicenseValid,
  isCargoWithinCapacity,
};
