import * as maintenanceService from '../services/maintenance.service.js';

/**
 * GET /api/maintenance
 * Get all maintenance logs.
 */
export const getMaintenance = async (req, res, next) => {
  try {
    const logs = await maintenanceService.getMaintenanceLogs();
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/maintenance/open
 * Open a maintenance session for a vehicle (puts it in shop).
 */
export const createMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.openMaintenance(req.body);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/maintenance/:id/close
 * Close a maintenance session for a vehicle (brings it out of shop).
 */
export const closeMaintenance = async (req, res, next) => {
  try {
    const log = await maintenanceService.closeMaintenance(req.params.id, req.body);
    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};
