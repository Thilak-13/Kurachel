import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { getValidatedVehicle } from './validation.service.js';

/**
 * Maps a database expense record to the API structure.
 */
const mapExpenseToApi = (e) => ({
  id: e.id,
  vehicleId: e.vehicleId,
  category: e.category,
  amount: e.amount,
  cost: e.amount,
  description: e.description || '',
  spentAt: e.spentAt,
  date: e.spentAt,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
  vehicle: e.vehicle ? {
    id: e.vehicle.id,
    registrationNumber: e.vehicle.registrationNumber,
    model: e.vehicle.make ? `${e.vehicle.make} ${e.vehicle.model}` : e.vehicle.model
  } : undefined
});

/**
 * Retrieve all expenses with filtering, sorting, and pagination.
 */
export const getExpenses = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const { vehicleId, category, sort } = query;

  const where = {};
  if (vehicleId) {
    where.vehicleId = vehicleId;
  }
  if (category) {
    where.category = category;
  }

  let orderBy = { spentAt: 'desc' };
  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    const allowedSortFields = ['category', 'amount', 'spentAt', 'createdAt'];
    if (allowedSortFields.includes(field)) {
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    }
  }

  const [expenses, totalItems] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { vehicle: true }
    }),
    prisma.expense.count({ where })
  ]);

  const meta = getPaginationMeta(totalItems, page, limit);
  return {
    expenses: expenses.map(mapExpenseToApi),
    meta
  };
};

/**
 * Get specific expense details by ID.
 */
export const getExpenseById = async (id) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { vehicle: true }
  });
  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }
  return mapExpenseToApi(expense);
};

/**
 * Create a new expense log. Supports direct vehicleId or resolving from tripId.
 */
export const createExpense = async (data) => {
  const { vehicleId, tripId, category, amount, cost, description, date, spentAt } = data;

  let resolvedVehicleId = vehicleId;
  const spentVal = parseFloat(amount || cost || 0.0);
  const spentDate = date || spentAt ? new Date(date || spentAt) : new Date();

  // If tripId is provided, resolve vehicleId from the trip
  if (tripId && !resolvedVehicleId) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }
    resolvedVehicleId = trip.vehicleId;
  }

  if (!resolvedVehicleId) {
    throw new ApiError(400, 'Vehicle ID or Trip ID is required to associate this expense');
  }

  // Validate that vehicle exists
  await getValidatedVehicle(resolvedVehicleId);

  const expense = await prisma.expense.create({
    data: {
      vehicleId: resolvedVehicleId,
      category,
      amount: spentVal,
      description: description || '',
      spentAt: spentDate
    },
    include: { vehicle: true }
  });

  const result = mapExpenseToApi(expense);
  if (tripId) {
    result.tripId = tripId;
  }
  return result;
};

/**
 * Update an existing expense record.
 */
export const updateExpense = async (id, data) => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Expense not found');
  }

  const updateData = {};

  if (data.vehicleId) {
    await getValidatedVehicle(data.vehicleId);
    updateData.vehicleId = data.vehicleId;
  }

  if (data.category !== undefined) {
    updateData.category = data.category;
  }

  if (data.amount !== undefined || data.cost !== undefined) {
    updateData.amount = parseFloat(data.amount || data.cost);
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.date !== undefined || data.spentAt !== undefined) {
    updateData.spentAt = new Date(data.date || data.spentAt);
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: updateData,
    include: { vehicle: true }
  });

  return mapExpenseToApi(updated);
};

/**
 * Delete an expense record.
 */
export const deleteExpense = async (id) => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Expense not found');
  }

  await prisma.expense.delete({ where: { id } });
  return true;
};
