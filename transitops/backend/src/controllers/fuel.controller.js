import * as fuelService from '../services/fuel.service.js';

/**
 * GET /api/fuel-logs
 * Retrieve all fuel logs with pagination, filtering, and sorting.
 */
export const getFuelLogs = async (req, res, next) => {
  try {
    const { fuelLogs } = await fuelService.getFuelLogs(req.query);
    res.status(200).json(fuelLogs);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/fuel-logs/:id
 * Retrieve specific fuel log details.
 */
export const getFuelLogById = async (req, res, next) => {
  try {
    const log = await fuelService.getFuelLogById(req.params.id);
    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/fuel-logs
 * Create a new fuel log.
 */
export const createFuelLog = async (req, res, next) => {
  try {
    const log = await fuelService.createFuelLog(req.body);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/fuel-logs/:id
 * Update an existing fuel log.
 */
export const updateFuelLog = async (req, res, next) => {
  try {
    const log = await fuelService.updateFuelLog(req.params.id, req.body);
    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/fuel-logs/:id
 * Delete a fuel log record.
 */
export const deleteFuelLog = async (req, res, next) => {
  try {
    await fuelService.deleteFuelLog(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
