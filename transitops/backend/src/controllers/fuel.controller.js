import prisma from '../config/db.js';

export const createFuelLog = async (req, res, next) => {
  try {
    const { vehicleId, liters, cost, odometerReading } = req.body;

    const log = await prisma.fuelLog.create({
      data: {
        vehicleId,
        fuelVolume: parseFloat(liters),
        cost: parseFloat(cost),
        odometerReading: odometerReading ? parseFloat(odometerReading) : null,
        loggedAt: new Date()
      }
    });

    res.status(201).json({
      id: log.id,
      vehicleId: log.vehicleId,
      liters: log.fuelVolume,
      cost: log.cost,
      odometerReading: log.odometerReading,
      timestamp: log.createdAt
    });
  } catch (error) {
    next(error);
  }
};
