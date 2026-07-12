import prisma from '../config/db.js';
import { dbToApiVehicleStatus } from './vehicle.service.js';

/**
 * Computes dashboard KPIs and extracts dynamic filters.
 */
export const getDashboardData = async () => {
  // Minimize DB roundtrips by running counts concurrently
  const [
    vehicleCounts,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    uniqueVehicleTypes,
    tripsForRegions
  ] = await Promise.all([
    // Group vehicles by status
    prisma.vehicle.groupBy({
      by: ['status'],
      _count: true
    }),
    // Count active trips
    prisma.trip.count({
      where: { status: 'EN_ROUTE' }
    }),
    // Count pending trips
    prisma.trip.count({
      where: { status: 'SCHEDULED' }
    }),
    // Count drivers on duty
    prisma.driver.count({
      where: { status: 'ON_TRIP' }
    }),
    // Get unique vehicle types
    prisma.vehicle.findMany({
      select: { type: true },
      distinct: ['type'],
      where: { type: { not: null } }
    }),
    // Get trips to derive cities/regions
    prisma.trip.findMany({
      select: { startLocation: true, endLocation: true }
    })
  ]);

  // Process vehicle status counts
  let activeVehicles = 0;
  let availableVehicles = 0;
  let vehiclesInMaintenance = 0;

  vehicleCounts.forEach((group) => {
    const count = group._count;
    if (group.status === 'ACTIVE') {
      availableVehicles += count;
      activeVehicles += count;
    } else if (group.status === 'IN_SERVICE') {
      activeVehicles += count;
    } else if (group.status === 'OUT_OF_SERVICE') {
      vehiclesInMaintenance += count;
      activeVehicles += count;
    }
  });

  // Calculate fleet utilization percentage
  const fleetUtilizationPercent = activeVehicles > 0 
    ? parseFloat(((activeTrips / activeVehicles) * 100).toFixed(2)) 
    : 0;

  // Process vehicle type options
  const vehicleType = uniqueVehicleTypes
    .map(v => v.type)
    .filter(Boolean);

  // Derive status presentation list
  const status = ['Available', 'On Trip', 'In Shop', 'Retired'];

  // Process cities/regions from locations (e.g. "Mumbai, MH" -> "Mumbai")
  const citiesSet = new Set();
  tripsForRegions.forEach((t) => {
    if (t.startLocation) {
      citiesSet.add(t.startLocation.split(',')[0].trim());
    }
    if (t.endLocation) {
      citiesSet.add(t.endLocation.split(',')[0].trim());
    }
  });
  const region = Array.from(citiesSet);

  return {
    kpis: {
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilizationPercent
    },
    filterOptions: {
      vehicleType,
      status,
      region
    }
  };
};
