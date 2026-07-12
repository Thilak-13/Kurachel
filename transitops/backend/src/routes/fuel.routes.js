import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import * as controller from '../controllers/fuel.controller.js';

const router = express.Router();

router.post('/', verifyToken, requirePermission('fuel-log:create'), controller.createFuelLog);

export default router;
