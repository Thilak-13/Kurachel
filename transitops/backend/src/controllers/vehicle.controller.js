import prisma from '../config/db.js';
import rules from '../../../shared/validators/dispatch.rules.js';

const { isRegNumberUnique, isValidStatusEnum } = rules;

// Status Mapping Layers
const apiToDbVehicleStatus = {
  'Available': 'ACTIVE',
  'On Trip': 'IN_SERVICE',
  'In Shop': 'OUT_OF_SERVICE',
  'Retired': 'DECOMMISSIONED'
};

const dbToApiVehicleStatus = {
  'ACTIVE': 'Available',
  'IN_SERVICE': 'On Trip',
  'OUT_OF_SERVICE': 'In Shop',
  'DECOMMISSIONED': 'Retired'
};

/**
 * GET /api/vehicles
 */
export const getVehicles = async (req, res, next) => {
  try {
    const statusFilter = req.query.status;
    const where = {};
    
    if (statusFilter) {
      const dbStatus = apiToDbVehicleStatus[statusFilter];
      if (dbStatus) {
        where.status = dbStatus;
      }
    }

    const vehicles = await prisma.vehicle.findMany({ where });

    const mappedVehicles = vehicles.map(v => ({
      id: v.id,
      registrationNumber: v.registrationNumber,
      model: v.model,
      type: v.type || null,
      maxLoadCapacity: v.maxLoadCapacity || null,
      odometer: v.odometer || null,
      acquisitionCost: v.acquisitionCost || null,
      status: dbToApiVehicleStatus[v.status] || v.status
    }));

    res.status(200).json(mappedVehicles);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/vehicles
 */
export const createVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, model, type, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;

    // 1. Uniqueness check for registration number
    const isUnique = await isRegNumberUnique(registrationNumber, prisma);
    if (!isUnique) {
      return res.status(409).json({
        errorCode: 'DUPLICATE_REG_NUMBER',
        message: 'Registration number already exists'
      });
    }

    // 2. Status validation check
    if (!isValidStatusEnum('vehicle', status)) {
      return res.status(400).json({
        errorCode: 'VALIDATION_ERROR',
        message: 'Invalid vehicle status'
      });
    }

    const dbStatus = apiToDbVehicleStatus[status];

    // Derive make if possible (e.g. from model "Ford Transit" -> make "Ford", model "Transit")
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
        model: derivedModel,
        make: derivedMake,
        type: type || null,
        maxLoadCapacity: maxLoadCapacity ? parseInt(maxLoadCapacity, 10) : null,
        odometer: odometer ? parseFloat(odometer) : null,
        acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : null,
        status: dbStatus
      }
    });

    res.status(201).json({
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      model: vehicle.make ? `${vehicle.make} ${vehicle.model}` : vehicle.model,
      type: vehicle.type,
      maxLoadCapacity: vehicle.maxLoadCapacity,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      status: dbToApiVehicleStatus[vehicle.status]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/vehicles/:id
 */
export const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { registrationNumber, model, type, maxLoadCapacity, odometer, acquisitionCost, status } = req.body;

    // Find if vehicle exists
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const updateData = {};

    if (model) {
      let derivedMake = null;
      let derivedModel = model;
      if (model.includes(' ')) {
        const parts = model.trim().split(/\s+/);
        derivedMake = parts[0];
        derivedModel = parts.slice(1).join(' ');
      }
      updateData.make = derivedMake;
      updateData.model = derivedModel;
    }

    if (type !== undefined) updateData.type = type;
    if (maxLoadCapacity !== undefined) updateData.maxLoadCapacity = maxLoadCapacity ? parseInt(maxLoadCapacity, 10) : null;
    if (odometer !== undefined) updateData.odometer = odometer ? parseFloat(odometer) : null;
    if (acquisitionCost !== undefined) updateData.acquisitionCost = acquisitionCost ? parseFloat(acquisitionCost) : null;

    // If updating registration number, check for duplicates
    if (registrationNumber && registrationNumber !== existing.registrationNumber) {
      const isUnique = await isRegNumberUnique(registrationNumber, prisma);
      if (!isUnique) {
        return res.status(409).json({
          errorCode: 'DUPLICATE_REG_NUMBER',
          message: 'Registration number already exists'
        });
      }
      updateData.registrationNumber = registrationNumber;
    }

    // Validate status if provided
    if (status) {
      if (!isValidStatusEnum('vehicle', status)) {
        return res.status(400).json({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid vehicle status'
        });
      }
      updateData.status = apiToDbVehicleStatus[status];
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      id: updated.id,
      registrationNumber: updated.registrationNumber,
      model: updated.make ? `${updated.make} ${updated.model}` : updated.model,
      type: updated.type,
      maxLoadCapacity: updated.maxLoadCapacity,
      odometer: updated.odometer,
      acquisitionCost: updated.acquisitionCost,
      status: dbToApiVehicleStatus[updated.status]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/vehicles/:id
 */
export const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find if vehicle exists
    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await prisma.vehicle.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
