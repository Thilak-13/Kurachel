// Dispatch validation rules
const { VehicleStatus, DriverStatus } = require('../enums');

/**
 * Checks if a vehicle's registration number is unique in the database.
 * @param {string} regNo 
 * @param {Object} dbClient - The database client instance (e.g., PrismaClient)
 * @returns {Promise<boolean>}
 */
async function isRegNumberUnique(regNo, dbClient) {
  if (!dbClient) {
    throw new Error('Database client parameter is required for unique check.');
  }
  const existingVehicle = await dbClient.vehicle.findUnique({
    where: { registrationNumber: regNo }
  });
  return !existingVehicle;
}

/**
 * Validates whether a value is a valid enum status for a given entity type.
 * @param {'vehicle' | 'driver'} entity 
 * @param {string} value 
 * @returns {boolean}
 */
function isValidStatusEnum(entity, value) {
  if (entity === 'vehicle') {
    return Object.values(VehicleStatus).includes(value);
  }
  if (entity === 'driver') {
    return Object.values(DriverStatus).includes(value);
  }
  return false;
}

/**
 * Checks if a vehicle status is 'Available' and eligible for dispatch.
 * @param {Object} vehicle 
 * @returns {boolean}
 */
function isVehicleAvailableForDispatch(vehicle) {
  if (!vehicle) return false;
  return vehicle.status === 'Available' || vehicle.status === 'ACTIVE';
}

/**
 * Checks if a driver status is 'Available' and eligible for dispatch.
 * @param {Object} driver 
 * @returns {boolean}
 */
function isDriverAvailableForDispatch(driver) {
  if (!driver) return false;
  return driver.status === 'Available' || driver.status === 'AVAILABLE';
}

/**
 * Checks if a driver's license is valid and not expired or suspended.
 * @param {Object} driver 
 * @returns {boolean}
 */
function isLicenseValid(driver) {
  if (!driver) return false;
  const today = new Date().toISOString().split('T')[0];
  const isNotExpired = driver.licenseExpiryDate ? driver.licenseExpiryDate > today : false;
  const isNotSuspended = driver.status !== 'Suspended' && driver.status !== 'INACTIVE';
  return isNotExpired && isNotSuspended;
}

/**
 * Checks if the cargo weight does not exceed the vehicle's max load capacity.
 * @param {number} cargoWeight 
 * @param {Object} vehicle 
 * @returns {boolean}
 */
function isCargoWithinCapacity(cargoWeight, vehicle) {
  if (!vehicle) return false;
  if (vehicle.maxLoadCapacity === undefined || vehicle.maxLoadCapacity === null) return true;
  return Number(cargoWeight) <= Number(vehicle.maxLoadCapacity);
}

module.exports = {
  isRegNumberUnique,
  isValidStatusEnum,
  isVehicleAvailableForDispatch,
  isDriverAvailableForDispatch,
  isLicenseValid,
  isCargoWithinCapacity,
};
