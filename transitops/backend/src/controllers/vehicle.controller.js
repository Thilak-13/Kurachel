import * as vehicleService from '../services/vehicle.service.js';

/**
 * GET /api/vehicles
 * Get all vehicles with filtering, search, pagination, and sorting.
 */
export const getVehicles = async (req, res, next) => {
  try {
    const { vehicles } = await vehicleService.getVehicles(req.query);
    res.status(200).json(vehicles);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/vehicles/:id
 * Retrieve a specific vehicle by ID.
 */
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/vehicles
 * Create a new vehicle record.
 */
export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/vehicles/:id
 * Update an existing vehicle record.
 */
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.status(200).json(vehicle);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/vehicles/:id
 * Delete a vehicle record.
 */
export const deleteVehicle = async (req, res, next) => {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
