import prisma from '../config/db.js';

export const createExpense = async (req, res, next) => {
  try {
    const { tripId, category, cost, description } = req.body;

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const expense = await prisma.expense.create({
      data: {
        vehicleId: trip.vehicleId,
        category,
        amount: parseFloat(cost),
        description: description || '',
        spentAt: new Date()
      }
    });

    res.status(201).json({
      id: expense.id,
      tripId,
      category: expense.category,
      cost: expense.amount,
      description: expense.description
    });
  } catch (error) {
    next(error);
  }
};
