import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import { expenseValidator } from '../validators/expense.validator.js';
import * as controller from '../controllers/expense.controller.js';

const router = express.Router();

// GET /api/expenses - List all expenses
router.get('/', verifyToken, requirePermission('expense:view'), controller.getExpenses);

// GET /api/expenses/:id - Retrieve specific expense details
router.get('/:id', verifyToken, requirePermission('expense:view'), controller.getExpenseById);

// POST /api/expenses - Create a new expense log
router.post('/', verifyToken, requirePermission('expense:create'), expenseValidator, controller.createExpense);

// PUT /api/expenses/:id - Update an existing expense record
router.put('/:id', verifyToken, requirePermission('expense:create'), expenseValidator, controller.updateExpense);

// DELETE /api/expenses/:id - Remove an expense record
router.delete('/:id', verifyToken, requirePermission('expense:create'), controller.deleteExpense);

export default router;
