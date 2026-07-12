import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import * as controller from '../controllers/driver.controller.js';

const router = express.Router();

// GET /api/drivers
router.get('/', verifyToken, requirePermission('driver:view'), controller.getDrivers);

// POST /api/drivers
router.post('/', verifyToken, requirePermission('driver:create'), controller.createDriver);

// PUT /api/drivers/:id
router.put('/:id', verifyToken, requirePermission('driver:update'), controller.updateDriver);

// DELETE /api/drivers/:id
router.delete('/:id', verifyToken, requirePermission('driver:delete'), controller.deleteDriver);

export default router;
