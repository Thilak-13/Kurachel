import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { getValidatedVehicle } from './validation.service.js';

/**
 * Maps a database fuel log record to the API structure.
 */
const mapFuelLogToApi = (f) => ({
  id: f.id,
  vehicleId: f.vehicleId,
  liters: f.fuelVolume,
  fuelVolume: f.fuelVolume,
  cost: f.cost,
  odometerReading: f.odometerReading,
  odometer: f.odometerReading,
  loggedAt: f.loggedAt,
  date: f.loggedAt,
  createdAt: f.createdAt,
  updatedAt: f.updatedAt,
  vehicle: f.vehicle ? {
    id: f.vehicle.id,
    registrationNumber: f.vehicle.registrationNumber,
    model: f.vehicle.make ? `${f.vehicle.make} ${f.vehicle.model}` : f.vehicle.model
  } : undefined
});

/**
 * Get fuel logs with filtering, sorting, and pagination.
 */
export const getFuelLogs = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const { vehicleId, sort } = query;

  const where = {};
  if (vehicleId) {
    where.vehicleId = vehicleId;
  }

  let orderBy = { loggedAt: 'desc' };
  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    const allowedSortFields = ['fuelVolume', 'cost', 'odometerReading', 'loggedAt', 'createdAt'];
    if (allowedSortFields.includes(field)) {
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    }
  }

  const [logs, totalItems] = await Promise.all([
    prisma.fuelLog.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { vehicle: true }
    }),
    prisma.fuelLog.count({ where })
  ]);

  const meta = getPaginationMeta(totalItems, page, limit);
  return {
    fuelLogs: logs.map(mapFuelLogToApi),
    meta
  };
};

/**
 * Get a specific fuel log by ID.
 */
export const getFuelLogById = async (id) => {
  const log = await prisma.fuelLog.findUnique({
    where: { id },
    include: { vehicle: true }
  });
  if (!log) {
    throw new ApiError(404, 'Fuel log not found');
  }
  return mapFuelLogToApi(log);
};

/**
 * Create a new fuel log record.
 */
export const createFuelLog = async (data) => {
  const { vehicleId, liters, fuelVolume, cost, odometer, odometerReading, date, loggedAt } = data;

  const vol = parseFloat(liters || fuelVolume);
  const odom = odometerReading || odometer ? parseFloat(odometerReading || odometer) : null;
  const logDate = date || loggedAt ? new Date(date || loggedAt) : new Date();

  // Validate vehicle exists
  await getValidatedVehicle(vehicleId);

  const log = await prisma.fuelLog.create({
    data: {
      vehicleId,
      fuelVolume: vol,
      cost: parseFloat(cost),
      odometerReading: odom,
      loggedAt: logDate
    },
    include: { vehicle: true }
  });

  return mapFuelLogToApi(log);
};

/**
 * Update an existing fuel log record.
 */
export const updateFuelLog = async (id, data) => {
  const existing = await prisma.fuelLog.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Fuel log not found');
  }

  const updateData = {};

  if (data.vehicleId) {
    await getValidatedVehicle(data.vehicleId);
    updateData.vehicleId = data.vehicleId;
  }

  if (data.liters !== undefined || data.fuelVolume !== undefined) {
    updateData.fuelVolume = parseFloat(data.liters || data.fuelVolume);
  }

  if (data.cost !== undefined) {
    updateData.cost = parseFloat(data.cost);
  }

  if (data.odometer !== undefined || data.odometerReading !== undefined) {
    updateData.odometerReading = parseFloat(data.odometer || data.odometerReading);
  }

  if (data.date !== undefined || data.loggedAt !== undefined) {
    updateData.loggedAt = new Date(data.date || data.loggedAt);
  }

  const updated = await prisma.fuelLog.update({
    where: { id },
    data: updateData,
    include: { vehicle: true }
  });

  return mapFuelLogToApi(updated);
};

/**
 * Delete a fuel log record.
 */
export const deleteFuelLog = async (id) => {
  const existing = await prisma.fuelLog.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Fuel log not found');
  }

  await prisma.fuelLog.delete({ where: { id } });
  return true;
};
