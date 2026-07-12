import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import * as controller from '../controllers/dashboard.controller.js';

const router = express.Router();

// GET /api/dashboard - Retrieve operations metrics
router.get('/', verifyToken, requirePermission('dashboard:view'), controller.getDashboard);

export default router;
