import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import * as controller from '../controllers/vehicle.controller.js';

const router = express.Router();

// GET /api/vehicles
router.get('/', verifyToken, requirePermission('vehicle:view'), controller.getVehicles);

// POST /api/vehicles
router.post('/', verifyToken, requirePermission('vehicle:create'), controller.createVehicle);

// PUT /api/vehicles/:id
router.put('/:id', verifyToken, requirePermission('vehicle:update'), controller.updateVehicle);

// DELETE /api/vehicles/:id
router.delete('/:id', verifyToken, requirePermission('vehicle:delete'), controller.deleteVehicle);

export default router;
