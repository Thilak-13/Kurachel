import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import * as controller from '../controllers/maintenance.controller.js';

const router = express.Router();

// GET /api/maintenance
router.get('/', verifyToken, requirePermission('maintenance:view'), controller.getMaintenance);

// POST /api/maintenance
router.post('/', verifyToken, requirePermission('maintenance:create'), controller.createMaintenance);

// POST /api/maintenance/:id/close
router.post('/:id/close', verifyToken, requirePermission('maintenance:update'), controller.closeMaintenance);

export default router;
