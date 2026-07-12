import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { checkRegNumberUnique } from './validation.service.js';

// Enums mapping between API presentation and DB persistence
export const apiToDbVehicleStatus = {
  'Available': 'ACTIVE',
  'On Trip': 'IN_SERVICE',
  'In Shop': 'OUT_OF_SERVICE',
  'Retired': 'DECOMMISSIONED'
};

export const dbToApiVehicleStatus = {
  'ACTIVE': 'Available',
  'IN_SERVICE': 'On Trip',
  'OUT_OF_SERVICE': 'In Shop',
  'DECOMMISSIONED': 'Retired'
};

/**
 * Maps a database vehicle record to the API structure.
 */
export const mapVehicleToApi = (v) => ({
  id: v.id,
  registrationNumber: v.registrationNumber,
  model: v.make ? `${v.make} ${v.model}` : v.model,
  type: v.type || null,
  maxLoadCapacity: v.maxLoadCapacity || null,
  odometer: v.odometer || null,
  acquisitionCost: v.acquisitionCost || null,
  status: dbToApiVehicleStatus[v.status] || v.status
});

/**
 * Get all vehicles with filtering, search, pagination, and sorting.
 */
export const getVehicles = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const { search, status, sort } = query;

  const where = {};

  if (status) {
    const dbStatus = apiToDbVehicleStatus[status];
    if (dbStatus) {
      where.status = dbStatus;
    }
  }

  if (search) {
    where.OR = [
      { registrationNumber: { contains: search } },
      { model: { contains: search } },
      { make: { contains: search } },
      { type: { contains: search } }
    ];
  }

  let orderBy = { createdAt: 'desc' };
  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    
    // Validate sortable fields to prevent injection
    const allowedSortFields = ['registrationNumber', 'model', 'year', 'maxLoadCapacity', 'odometer', 'acquisitionCost', 'status', 'createdAt'];
    if (allowedSortFields.includes(field)) {
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    }
  }

  const [vehicles, totalItems] = await Promise.all([
    prisma.vehicle.findMany({ where, skip, take, orderBy }),
    prisma.vehicle.count({ where })
  ]);

  const meta = getPaginationMeta(totalItems, page, limit);
  return {
    vehicles: vehicles.map(mapVehicleToApi),
    meta
  };
};

/**
 * Find a specific vehicle by ID.
 */
export const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id }
  });
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle not found');
  }
  return mapVehicleToApi(vehicle);
};

/**
 * Create a new vehicle record.
 */
export const createVehicle = async (data) => {
  const { registrationNumber, model, type, maxLoadCapacity, odometer, acquisitionCost, status = 'Available' } = data;

  // Validate registration number uniqueness
  const isUnique = await checkRegNumberUnique(registrationNumber);
  if (!isUnique) {
    throw new ApiError(409, 'Registration number already exists', [{
      field: 'registrationNumber',
      message: 'Registration number already exists'
    }], 'DUPLICATE_REG_NUMBER');
  }

  const dbStatus = apiToDbVehicleStatus[status] || 'ACTIVE';

  // Derive make from model name if possible
  let derivedMake = null;
  let derivedModel = model;
  if (model && model.includes(' ')) {
    const parts = model.trim().split(/\s+/);
    derivedMake = parts[0];
    derivedModel = parts.slice(1).join(' ');
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNumber,
      make: derivedMake,
      model: derivedModel,
      type: type || null,
      maxLoadCapacity: maxLoadCapacity ? parseInt(maxLoadCapacity, 10) : null,
      odometer: odometer ? parseFloat(odometer) : null,
      acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : null,
      status: dbStatus
    }
  });

  return mapVehicleToApi(vehicle);
};

/**
 * Update an existing vehicle.
 */
export const updateVehicle = async (id, data) => {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Vehicle not found');
  }

  const updateData = {};

  if (data.model) {
    let derivedMake = null;
    let derivedModel = data.model;
    if (data.model.includes(' ')) {
      const parts = data.model.trim().split(/\s+/);
      derivedMake = parts[0];
      derivedModel = parts.slice(1).join(' ');
    }
    updateData.make = derivedMake;
    updateData.model = derivedModel;
  }

  if (data.type !== undefined) updateData.type = data.type;
  if (data.maxLoadCapacity !== undefined) {
    updateData.maxLoadCapacity = data.maxLoadCapacity ? parseInt(data.maxLoadCapacity, 10) : null;
  }
  if (data.odometer !== undefined) {
    updateData.odometer = data.odometer ? parseFloat(data.odometer) : null;
  }
  if (data.acquisitionCost !== undefined) {
    updateData.acquisitionCost = data.acquisitionCost ? parseFloat(data.acquisitionCost) : null;
  }

  if (data.registrationNumber && data.registrationNumber !== existing.registrationNumber) {
    const isUnique = await checkRegNumberUnique(data.registrationNumber, id);
    if (!isUnique) {
      throw new ApiError(409, 'Registration number already exists', [{
        field: 'registrationNumber',
        message: 'Registration number already exists'
      }], 'DUPLICATE_REG_NUMBER');
    }
    updateData.registrationNumber = data.registrationNumber;
  }

  if (data.status) {
    const dbStatus = apiToDbVehicleStatus[data.status];
    if (dbStatus) {
      updateData.status = dbStatus;
    }
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: updateData
  });

  return mapVehicleToApi(updated);
};

/**
 * Delete a vehicle by ID.
 */
export const deleteVehicle = async (id) => {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Vehicle not found');
  }

  await prisma.vehicle.delete({ where: { id } });
  return true;
};
