import prisma from '../config/db.js';
import maintenanceRules from '../../../shared/validators/maintenance.rules.js';

const { canCloseMaintenance } = maintenanceRules;

/**
 * GET /api/maintenance
 */
export const getMaintenance = async (req, res, next) => {
  try {
    const logs = await prisma.maintenanceLog.findMany({
      include: { vehicle: true }
    });

    const mapped = logs.map(l => {
      // Extract type from prefix if we formatted it as "Type: Description"
      let type = 'Routine';
      let desc = l.description;
      if (l.description.includes(':')) {
        const parts = l.description.split(':');
        type = parts[0].trim();
        desc = parts.slice(1).join(':').trim();
      }

      return {
        id: l.id,
        vehicleId: l.vehicleId,
        type,
        description: desc,
        cost: l.cost,
        status: l.vehicle.status === 'OUT_OF_SERVICE' ? 'In Shop' : 'Completed',
        dateOpened: l.createdAt,
        dateClosed: l.cost > 0 || l.performedAt > l.createdAt ? l.performedAt : null
      };
    });

    res.status(200).json(mapped);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/maintenance
 */
export const createMaintenance = async (req, res, next) => {
  try {
    const { vehicleId, type, description } = req.body;

    const log = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        throw new Error('Vehicle not found');
      }

      const formattedDesc = `${type || 'Routine'}: ${description || ''}`;

      const newLog = await tx.maintenanceLog.create({
        data: {
          vehicleId,
          description: formattedDesc,
          cost: 0.0,
          performedAt: new Date()
        }
      });

      // Force vehicle status to OUT_OF_SERVICE (In Shop) immediately, overriding active trip
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'OUT_OF_SERVICE' }
      });

      return newLog;
    });

    res.status(201).json({
      id: log.id,
      vehicleId: log.vehicleId,
      type: type || 'Routine',
      description: description || '',
      cost: log.cost,
      status: 'In Shop',
      dateOpened: log.createdAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/maintenance/:id/close
 */
export const closeMaintenance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cost } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.findUnique({
        where: { id },
        include: { vehicle: true }
      });

      if (!log) {
        return { status: 404, data: { message: 'Maintenance record not found' } };
      }

      const updatedLog = await tx.maintenanceLog.update({
        where: { id },
        data: {
          cost: cost ? parseFloat(cost) : 0.0,
          performedAt: new Date()
        }
      });

      // If vehicle can be closed (e.g. not retired), restore it to Available (ACTIVE)
      if (canCloseMaintenance(log.vehicle)) {
        await tx.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: 'ACTIVE' }
        });
      }

      return { status: 200, data: updatedLog };
    });

    if (result.status !== 200) {
      return res.status(result.status).json(result.data);
    }

    res.status(200).json({
      id: result.data.id,
      vehicleId: result.data.vehicleId,
      cost: result.data.cost,
      status: 'Completed',
      dateClosed: result.data.performedAt
    });
  } catch (error) {
    next(error);
  }
};
