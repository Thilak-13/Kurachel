import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import * as validationService from './validation.service.js';

export const apiToDbTripStatus = {
  'Draft': 'SCHEDULED',
  'Dispatched': 'EN_ROUTE',
  'Completed': 'COMPLETED',
  'Cancelled': 'CANCELLED'
};

export const dbToApiTripStatus = {
  'SCHEDULED': 'Draft',
  'EN_ROUTE': 'Dispatched',
  'COMPLETED': 'Completed',
  'CANCELLED': 'Cancelled'
};

/**
 * Map database trip object to API structure.
 */
const mapTripToApi = (t) => ({
  id: t.id,
  tripNumber: t.tripNumber,
  vehicleId: t.vehicleId,
  driverId: t.driverId,
  status: dbToApiTripStatus[t.status] || t.status,
  source: t.startLocation,
  startLocation: t.startLocation,
  destination: t.endLocation,
  endLocation: t.endLocation,
  startTime: t.startTime || null,
  endTime: t.endTime || null,
  distance: t.distance || null,
  cargoWeight: t.cargoWeight || null,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
  vehicle: t.vehicle ? {
    id: t.vehicle.id,
    registrationNumber: t.vehicle.registrationNumber,
    model: t.vehicle.make ? `${t.vehicle.make} ${t.vehicle.model}` : t.vehicle.model,
    maxLoadCapacity: t.vehicle.maxLoadCapacity,
    odometer: t.vehicle.odometer
  } : undefined,
  driver: t.driver ? {
    id: t.driver.id,
    name: t.driver.name || `${t.driver.firstName} ${t.driver.lastName}`.trim(),
    licenseNumber: t.driver.licenseNumber,
    contact: t.driver.contact || t.driver.phone
  } : undefined
});

/**
 * Get trips with filtering, search, pagination, and sorting.
 */
export const getTrips = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const { search, status, sort, vehicleId, driverId } = query;

  const where = {};

  if (status) {
    const dbStatus = apiToDbTripStatus[status];
    if (dbStatus) {
      where.status = dbStatus;
    }
  }

  if (vehicleId) where.vehicleId = vehicleId;
  if (driverId) where.driverId = driverId;

  if (search) {
    where.OR = [
      { tripNumber: { contains: search } },
      { startLocation: { contains: search } },
      { endLocation: { contains: search } }
    ];
  }

  let orderBy = { createdAt: 'desc' };
  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    const allowedSortFields = ['tripNumber', 'status', 'startLocation', 'endLocation', 'startTime', 'endTime', 'distance', 'createdAt'];
    if (allowedSortFields.includes(field)) {
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    }
  }

  const [trips, totalItems] = await Promise.all([
    prisma.trip.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        vehicle: true,
        driver: true
      }
    }),
    prisma.trip.count({ where })
  ]);

  const meta = getPaginationMeta(totalItems, page, limit);
  return {
    trips: trips.map(mapTripToApi),
    meta
  };
};

/**
 * Retrieve a specific trip by ID.
 */
export const getTripById = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true
    }
  });
  if (!trip) {
    throw new ApiError(404, 'Trip not found');
  }
  return mapTripToApi(trip);
};

/**
 * Create a new Trip (initially Draft / SCHEDULED status).
 */
export const createTrip = async (data) => {
  const { vehicleId, driverId, source, startLocation, destination, endLocation, cargoWeight, plannedDistance } = data;

  const srcLoc = startLocation || source;
  const destLoc = endLocation || destination;

  if (!srcLoc || !destLoc) {
    throw new ApiError(400, 'Start location (source) and end location (destination) are required');
  }

  // 1. Validate entities exist
  const vehicle = await validationService.getValidatedVehicle(vehicleId);
  const driver = await validationService.getValidatedDriver(driverId);

  // 2. Validate availability
  validationService.validateVehicleAvailable(vehicle);
  validationService.validateDriverAvailable(driver);

  // 3. Validate license expiration
  validationService.validateLicenseNotExpired(driver);

  // 4. Validate cargo weight limits
  if (cargoWeight) {
    validationService.validateCargoWeightLimit(parseFloat(cargoWeight), vehicle);
  }

  // Generate a random unique trip number
  const tripNumber = `TRIP-IN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const trip = await prisma.trip.create({
    data: {
      tripNumber,
      vehicleId,
      driverId,
      status: 'SCHEDULED',
      startLocation: srcLoc,
      endLocation: destLoc,
      distance: plannedDistance ? parseFloat(plannedDistance) : null,
      cargoWeight: cargoWeight ? parseFloat(cargoWeight) : null
    },
    include: {
      vehicle: true,
      driver: true
    }
  });

  return mapTripToApi(trip);
};

/**
 * Dispatch a trip (SCHEDULED -> EN_ROUTE).
 * Performed inside a Prisma Transaction to prevent race conditions.
 */
export const dispatchTrip = async (id) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Get trip with write lock (conceptually via SELECT)
    const trip = await tx.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true }
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    if (trip.status !== 'SCHEDULED') {
      throw new ApiError(400, `Only Draft trips can be dispatched. Current status: ${dbToApiTripStatus[trip.status]}`);
    }

    // 2. Double check vehicle and driver availability in transaction to prevent double bookings
    if (trip.vehicle.status !== 'ACTIVE') {
      throw new ApiError(400, `Vehicle is not active/available (Status: ${trip.vehicle.status})`);
    }
    if (trip.driver.status !== 'AVAILABLE') {
      throw new ApiError(400, `Driver is not available (Status: ${trip.driver.status})`);
    }

    // 2b. Re-validate license expiry + cargo weight INSIDE the transaction (TOCTOU gap fix).
    // A driver's license could expire after the trip was created but before dispatch.
    validationService.validateLicenseNotExpired(trip.driver);
    if (trip.cargoWeight) {
      validationService.validateCargoWeightLimit(trip.cargoWeight, trip.vehicle);
    }

    // 3. Update simultaneously: vehicle status, driver status, trip status
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'IN_SERVICE' } // On Trip
    });

    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'ON_TRIP' }
    });

    const updatedTrip = await tx.trip.update({
      where: { id },
      data: {
        status: 'EN_ROUTE', // Dispatched
        startTime: new Date()
      },
      include: {
        vehicle: true,
        driver: true
      }
    });

    return mapTripToApi(updatedTrip);
  });
};

/**
 * Complete a trip (EN_ROUTE -> COMPLETED).
 * Captures final odometer and fuel consumed, releases driver and vehicle inside a transaction.
 */
export const completeTrip = async (id, data) => {
  const { finalOdometer, fuelConsumed } = data;
  const odomVal = parseFloat(finalOdometer);

  return await prisma.$transaction(async (tx) => {
    // 1. Retrieve trip, driver, vehicle details
    const trip = await tx.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true }
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    if (trip.status !== 'EN_ROUTE') {
      throw new ApiError(400, `Only Dispatched trips can be completed. Current status: ${dbToApiTripStatus[trip.status]}`);
    }

    const startOdom = trip.vehicle.odometer || 0;
    if (odomVal < startOdom) {
      throw new ApiError(400, `Final odometer (${odomVal}) cannot be less than start odometer (${startOdom})`);
    }

    const distanceTravelled = odomVal - startOdom;

    // 2. Update Vehicle back to Active/Available and save new odometer
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: 'ACTIVE', // Available
        odometer: odomVal
      }
    });

    // 3. Update Driver back to Available
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'AVAILABLE' }
    });

    // 4. Optionally, if fuel consumed is reported, log a fuel entry
    if (fuelConsumed && parseFloat(fuelConsumed) > 0) {
      const volume = parseFloat(fuelConsumed);
      await tx.fuelLog.create({
        data: {
          vehicleId: trip.vehicleId,
          fuelVolume: volume,
          cost: volume * 90.0, // Assume ₹90 per liter standard pricing
          odometerReading: odomVal,
          loggedAt: new Date()
        }
      });
    }

    // 5. Update Trip status to COMPLETED and save distance/end time
    const updatedTrip = await tx.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        distance: distanceTravelled
      },
      include: {
        vehicle: true,
        driver: true
      }
    });

    return mapTripToApi(updatedTrip);
  });
};

/**
 * Cancel a trip (allowed only from Dispatched / EN_ROUTE).
 * Restores driver and vehicle availability inside a transaction.
 */
export const cancelTrip = async (id) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Retrieve trip
    const trip = await tx.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true }
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    if (trip.status !== 'EN_ROUTE') {
      throw new ApiError(400, `Only Dispatched (en route) trips can be cancelled. Current status: ${dbToApiTripStatus[trip.status]}`);
    }

    // 2. Restore Vehicle status to Active/Available
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: 'ACTIVE' }
    });

    // 3. Restore Driver status to Available
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'AVAILABLE' }
    });

    // 4. Update Trip status to CANCELLED
    const updatedTrip = await tx.trip.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        vehicle: true,
        driver: true
      }
    });

    return mapTripToApi(updatedTrip);
  });
};
