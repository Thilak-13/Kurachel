import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import { driverValidator } from '../validators/driver.validator.js';
import * as controller from '../controllers/driver.controller.js';

const router = express.Router();

// GET /api/drivers - List all drivers
router.get('/', verifyToken, requirePermission('driver:view'), controller.getDrivers);

// GET /api/drivers/:id - Get details of a specific driver
router.get('/:id', verifyToken, requirePermission('driver:view'), controller.getDriverById);

// POST /api/drivers - Create a new driver record
router.post('/', verifyToken, requirePermission('driver:create'), driverValidator, controller.createDriver);

// PUT /api/drivers/:id - Update an existing driver record
router.put('/:id', verifyToken, requirePermission('driver:update'), driverValidator, controller.updateDriver);

// DELETE /api/drivers/:id - Delete a driver record
router.delete('/:id', verifyToken, requirePermission('driver:delete'), controller.deleteDriver);

export default router;
