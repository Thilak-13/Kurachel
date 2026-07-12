import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

/**
 * Reusable Business Validation Service
 */

/**
 * Checks if a vehicle registration number is unique.
 * @param {string} registrationNumber 
 * @param {string} [excludeId] - ID to exclude from search (for updates)
 * @returns {Promise<boolean>}
 */
export const checkRegNumberUnique = async (registrationNumber, excludeId = null) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { registrationNumber },
  });
  if (!vehicle) return true;
  if (excludeId && vehicle.id === excludeId) return true;
  return false;
};

/**
 * Checks if a vehicle exists and returns it.
 * @param {string} vehicleId 
 * @returns {Promise<object>} Vehicle
 */
export const getValidatedVehicle = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId }
  });
  if (!vehicle) {
    throw new ApiError(404, `Vehicle with ID '${vehicleId}' not found`);
  }
  return vehicle;
};

/**
 * Checks if a driver exists and returns it.
 * @param {string} driverId 
 * @returns {Promise<object>} Driver
 */
export const getValidatedDriver = async (driverId) => {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId }
  });
  if (!driver) {
    throw new ApiError(404, `Driver with ID '${driverId}' not found`);
  }
  return driver;
};

/**
 * Checks if a trip exists and returns it.
 * @param {string} tripId 
 * @returns {Promise<object>} Trip
 */
export const getValidatedTrip = async (tripId) => {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId }
  });
  if (!trip) {
    throw new ApiError(404, `Trip with ID '${tripId}' not found`);
  }
  return trip;
};

/**
 * Checks if a maintenance log exists and returns it.
 * @param {string} logId 
 * @returns {Promise<object>} MaintenanceLog
 */
export const getValidatedMaintenance = async (logId) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id: logId }
  });
  if (!log) {
    throw new ApiError(404, `Maintenance log with ID '${logId}' not found`);
  }
  return log;
};

/**
 * Validates that a driver is available.
 * @param {object} driver 
 */
export const validateDriverAvailable = (driver) => {
  if (driver.status !== 'AVAILABLE') {
    throw new ApiError(400, `Driver is not available (Current status: ${driver.status})`);
  }
};

/**
 * Validates that a vehicle is active/available.
 * @param {object} vehicle 
 */
export const validateVehicleAvailable = (vehicle) => {
  if (vehicle.status !== 'ACTIVE') {
    throw new ApiError(400, `Vehicle is not available (Current status: ${vehicle.status})`);
  }
};

/**
 * Validates that a driver's license is not expired.
 * @param {object} driver 
 */
export const validateLicenseNotExpired = (driver) => {
  if (!driver.licenseExpiryDate) return;
  const expiry = new Date(driver.licenseExpiryDate);
  const now = new Date();
  if (expiry < now) {
    throw new ApiError(400, `Driver license is expired (Expiry date: ${driver.licenseExpiryDate})`);
  }
};

/**
 * Validates that cargo weight does not exceed vehicle capacity.
 * @param {number} cargoWeight 
 * @param {object} vehicle 
 */
export const validateCargoWeightLimit = (cargoWeight, vehicle) => {
  if (vehicle.maxLoadCapacity && cargoWeight > vehicle.maxLoadCapacity) {
    throw new ApiError(
      400, 
      `Cargo weight of ${cargoWeight} kg exceeds vehicle max capacity of ${vehicle.maxLoadCapacity} kg`
    );
  }
};
