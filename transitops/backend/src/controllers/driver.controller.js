import * as driverService from '../services/driver.service.js';

/**
 * GET /api/drivers
 * Retrieve all drivers with optional filtering, search, pagination, and sorting.
 */
export const getDrivers = async (req, res, next) => {
  try {
    const { drivers } = await driverService.getDrivers(req.query);
    res.status(200).json(drivers);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/drivers/:id
 * Retrieve specific driver details.
 */
export const getDriverById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id);
    res.status(200).json(driver);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/drivers
 * Create a new driver record.
 */
export const createDriver = async (req, res, next) => {
  try {
    const driver = await driverService.createDriver(req.body);
    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/drivers/:id
 * Update an existing driver record.
 */
export const updateDriver = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body);
    res.status(200).json(driver);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/drivers/:id
 * Delete a driver record.
 */
export const deleteDriver = async (req, res, next) => {
  try {
    await driverService.deleteDriver(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
