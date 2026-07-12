import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import { vehicleValidator } from '../validators/vehicle.validator.js';
import * as controller from '../controllers/vehicle.controller.js';

const router = express.Router();

// GET /api/vehicles - List all vehicles
router.get('/', verifyToken, requirePermission('vehicle:view'), controller.getVehicles);

// GET /api/vehicles/:id - Retrieve specific vehicle details
router.get('/:id', verifyToken, requirePermission('vehicle:view'), controller.getVehicleById);

// POST /api/vehicles - Create a new vehicle record
router.post('/', verifyToken, requirePermission('vehicle:create'), vehicleValidator, controller.createVehicle);

// PUT /api/vehicles/:id - Update an existing vehicle record
router.put('/:id', verifyToken, requirePermission('vehicle:update'), vehicleValidator, controller.updateVehicle);

// DELETE /api/vehicles/:id - Remove a vehicle record
router.delete('/:id', verifyToken, requirePermission('vehicle:delete'), controller.deleteVehicle);

export default router;
