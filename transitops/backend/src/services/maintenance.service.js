import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import maintenanceRules from '../../../shared/validators/maintenance.rules.js';

const { canCloseMaintenance } = maintenanceRules;

/**
 * Format database record into presentation structure.
 */
const mapLogToApi = (l) => {
  let type = 'Routine';
  let desc = l.description;
  if (l.description && l.description.includes(':')) {
    const parts = l.description.split(':');
    type = parts[0].trim();
    desc = parts.slice(1).join(':').trim();
  }

  const isClosed = l.status === 'CLOSED';

  return {
    id: l.id,
    vehicleId: l.vehicleId,
    type,
    description: desc,
    cost: l.cost,
    status: l.status === 'OPEN' ? 'In Shop' : 'Completed',
    dateOpened: l.createdAt,
    dateClosed: isClosed ? l.performedAt : null,
    vehicle: l.vehicle ? {
      id: l.vehicle.id,
      registrationNumber: l.vehicle.registrationNumber,
      model: l.vehicle.make ? `${l.vehicle.make} ${l.vehicle.model}` : l.vehicle.model,
      status: l.vehicle.status
    } : undefined
  };
};

/**
 * Retrieve all maintenance logs.
 */
export const getMaintenanceLogs = async () => {
  const logs = await prisma.maintenanceLog.findMany({
    include: { vehicle: true },
    orderBy: { createdAt: 'desc' }
  });
  return logs.map(mapLogToApi);
};

/**
 * Open maintenance for a vehicle.
 * Simultaneously updates vehicle status to OUT_OF_SERVICE (In Shop) in a transaction.
 */
export const openMaintenance = async (data) => {
  const { vehicleId, type = 'Routine', description = '' } = data;

  return await prisma.$transaction(async (tx) => {
    // 1. Validate vehicle exists
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found');
    }

    const formattedDesc = `${type}: ${description}`;

    // 2. Create the maintenance log
    const newLog = await tx.maintenanceLog.create({
      data: {
        vehicleId,
        description: formattedDesc,
        cost: 0.0,
        performedAt: new Date(),
        status: 'OPEN'
      },
      include: { vehicle: true }
    });

    // 3. Force vehicle status to OUT_OF_SERVICE (In Shop) immediately
    await tx.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'OUT_OF_SERVICE' }
    });

    // Reload with updated vehicle status
    newLog.vehicle.status = 'OUT_OF_SERVICE';

    return mapLogToApi(newLog);
  });
};

/**
 * Close maintenance log.
 * Restores vehicle status to ACTIVE (Available) if not retired, inside a transaction.
 */
export const closeMaintenance = async (id, data) => {
  const { cost } = data;
  const costVal = parseFloat(cost) || 0.0;

  return await prisma.$transaction(async (tx) => {
    // 1. Get existing log
    const log = await tx.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true }
    });

    if (!log) {
      throw new ApiError(404, 'Maintenance record not found');
    }

    // 2. Update log cost and performance time
    const updatedLog = await tx.maintenanceLog.update({
      where: { id },
      data: {
        cost: costVal,
        performedAt: new Date(),
        status: 'CLOSED'
      },
      include: { vehicle: true }
    });

    // 3. If vehicle can be closed (not retired/decommissioned), restore status to ACTIVE (Available)
    if (canCloseMaintenance(log.vehicle)) {
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: 'ACTIVE' }
      });
      updatedLog.vehicle.status = 'ACTIVE';
    }

    return mapLogToApi(updatedLog);
  });
};
