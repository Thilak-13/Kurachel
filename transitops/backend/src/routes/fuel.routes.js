import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import { fuelValidator } from '../validators/fuel.validator.js';
import * as controller from '../controllers/fuel.controller.js';

const router = express.Router();

// GET /api/fuel-logs - List all fuel logs
router.get('/', verifyToken, requirePermission('fuel-log:view'), controller.getFuelLogs);

// GET /api/fuel-logs/:id - Get details of a specific fuel log
router.get('/:id', verifyToken, requirePermission('fuel-log:view'), controller.getFuelLogById);

// POST /api/fuel-logs - Create a new fuel log
router.post('/', verifyToken, requirePermission('fuel-log:create'), fuelValidator, controller.createFuelLog);

// PUT /api/fuel-logs/:id - Update an existing fuel log
router.put('/:id', verifyToken, requirePermission('fuel-log:create'), fuelValidator, controller.updateFuelLog);

// DELETE /api/fuel-logs/:id - Delete a fuel log record
router.delete('/:id', verifyToken, requirePermission('fuel-log:create'), controller.deleteFuelLog);

export default router;
