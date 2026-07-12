import * as expenseService from '../services/expense.service.js';

/**
 * GET /api/expenses
 * Retrieve all expenses with filtering, sorting, and pagination.
 */
export const getExpenses = async (req, res, next) => {
  try {
    const { expenses } = await expenseService.getExpenses(req.query);
    res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/expenses/:id
 * Retrieve specific expense details.
 */
export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/expenses
 * Create a new expense.
 */
export const createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/expenses/:id
 * Update an existing expense record.
 */
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    res.status(200).json(expense);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/expenses/:id
 * Delete an expense record.
 */
export const deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
