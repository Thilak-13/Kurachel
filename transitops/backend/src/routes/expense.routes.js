import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import * as controller from '../controllers/expense.controller.js';

const router = express.Router();

router.post('/', verifyToken, requirePermission('expense:create'), controller.createExpense);

export default router;
