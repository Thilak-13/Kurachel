import prisma from '../config/db.js';
import dispatchRules from '../../../shared/validators/dispatch.rules.js';

const {
  isVehicleAvailableForDispatch,
  isDriverAvailableForDispatch,
  isLicenseValid,
  isCargoWithinCapacity
} = dispatchRules;

// Status Mapping
const apiToDbTripStatus = {
  'Draft': 'SCHEDULED',
  'Dispatched': 'EN_ROUTE',
  'Completed': 'COMPLETED',
  'Cancelled': 'CANCELLED'
};

const dbToApiTripStatus = {
  'SCHEDULED': 'Draft',
  'EN_ROUTE': 'Dispatched',
  'COMPLETED': 'Completed',
  'CANCELLED': 'Cancelled'
};

// DB Statuses
const apiToDbVehicleStatus = {
  'Available': 'ACTIVE',
  'On Trip': 'IN_SERVICE',
  'In Shop': 'OUT_OF_SERVICE',
  'Retired': 'DECOMMISSIONED'
};

const apiToDbDriverStatus = {
  'Available': 'AVAILABLE',
  'On Trip': 'ON_TRIP',
  'Suspended': 'INACTIVE',
  'Off Duty': 'ON_LEAVE'
};

const dbToApiVehicleStatus = {
  'ACTIVE': 'Available',
  'IN_SERVICE': 'On Trip',
  'OUT_OF_SERVICE': 'In Shop',
  'DECOMMISSIONED': 'Retired'
};

const dbToApiDriverStatus = {
  'AVAILABLE': 'Available',
  'ON_TRIP': 'On Trip',
  'INACTIVE': 'Suspended',
  'ON_LEAVE': 'Off Duty'
};

/**
 * GET /api/trips
 */
export const getTrips = async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      include: {
        vehicle: true,
        driver: true
      }
    });

    const mapped = trips.map(t => ({
      id: t.id,
      tripNumber: t.tripNumber,
      vehicleId: t.vehicleId,
      driverId: t.driverId,
      routeName: t.startLocation && t.endLocation ? `${t.startLocation} to ${t.endLocation}` : 'Unknown Route',
      startLocation: t.startLocation,
      endLocation: t.endLocation,
      cargoWeight: t.distance || 0, // distance holds cargo weight in mock / contract if needed, let's map correctly
      status: dbToApiTripStatus[t.status] || t.status,
      createdAt: t.createdAt,
      startTime: t.startTime,
      endTime: t.endTime
    }));

    res.status(200).json(mapped);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips (create as Draft)
 */
export const createTrip = async (req, res, next) => {
  try {
    const { vehicleId, driverId, routeName, cargoWeight, startLocation, endLocation, plannedDistance } = req.body;

    const tripNumber = `TRIP-${Math.floor(Math.random() * 1000000)}`;

    const trip = await prisma.trip.create({
      data: {
        tripNumber,
        vehicleId,
        driverId,
        startLocation: startLocation || routeName || 'Unknown Start',
        endLocation: endLocation || 'Unknown End',
        status: 'SCHEDULED', // Draft
        distance: cargoWeight ? parseFloat(cargoWeight) : null // Store cargoWeight in distance/custom field
      }
    });

    res.status(201).json({
      id: trip.id,
      tripNumber: trip.tripNumber,
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      routeName: `${trip.startLocation} to ${trip.endLocation}`,
      startLocation: trip.startLocation,
      endLocation: trip.endLocation,
      cargoWeight: trip.distance,
      status: 'Draft'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/dispatch
 */
export const dispatchTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch trip, locking vehicle & driver
      const trip = await tx.trip.findUnique({
        where: { id },
        include: {
          vehicle: true,
          driver: true
        }
      });

      if (!trip) {
        return { status: 404, data: { message: 'Trip not found' } };
      }

      if (trip.status !== 'SCHEDULED') {
        return { status: 400, data: { errorCode: 'VALIDATION_ERROR', message: 'Trip is not in Draft status' } };
      }

      // Map DB formats back to API shapes for validator checks
      const apiVehicle = {
        status: dbToApiVehicleStatus[trip.vehicle.status] || trip.vehicle.status,
        maxLoadCapacity: trip.vehicle.maxLoadCapacity
      };

      const apiDriver = {
        status: dbToApiDriverStatus[trip.driver.status] || trip.driver.status,
        licenseExpiryDate: trip.driver.licenseExpiryDate
      };

      // 2. Perform validations
      if (!isVehicleAvailableForDispatch(apiVehicle)) {
        return { status: 400, data: { errorCode: 'VALIDATION_ERROR', message: 'Vehicle is not available for dispatch' } };
      }

      if (!isDriverAvailableForDispatch(apiDriver)) {
        return { status: 400, data: { errorCode: 'VALIDATION_ERROR', message: 'Driver is not available for dispatch' } };
      }

      if (!isLicenseValid(apiDriver)) {
        return { status: 400, data: { errorCode: 'VALIDATION_ERROR', message: 'Driver license is expired or suspended' } };
      }

      const tripWeight = trip.distance || 0; // Using distance field for cargo weight in schema
      if (!isCargoWithinCapacity(tripWeight, apiVehicle)) {
        return { status: 400, data: { errorCode: 'VALIDATION_ERROR', message: 'Cargo weight exceeds vehicle capacity' } };
      }

      // 3. Update statuses in single transaction
      const updatedTrip = await tx.trip.update({
        where: { id },
        data: { status: 'EN_ROUTE', startTime: new Date() }
      });

      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'IN_SERVICE' }
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'ON_TRIP' }
      });

      return { status: 200, data: updatedTrip };
    });

    if (result.status !== 200) {
      return res.status(result.status).json(result.data);
    }

    res.status(200).json({
      id: result.data.id,
      tripNumber: result.data.tripNumber,
      vehicleId: result.data.vehicleId,
      driverId: result.data.driverId,
      status: 'Dispatched'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/complete
 */
export const completeTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { finalOdometer, fuelUsed, remarks } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: { vehicle: true }
      });

      if (!trip) {
        return { status: 404, data: { message: 'Trip not found' } };
      }

      if (trip.status !== 'EN_ROUTE') {
        return { status: 400, data: { errorCode: 'VALIDATION_ERROR', message: 'Only dispatched trips can be completed' } };
      }

      const updatedTrip = await tx.trip.update({
        where: { id },
        data: { status: 'COMPLETED', endTime: new Date() }
      });

      // Update vehicle back to ACTIVE and set new odometer
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: 'ACTIVE',
          odometer: finalOdometer ? parseFloat(finalOdometer) : trip.vehicle.odometer
        }
      });

      // Update driver back to AVAILABLE
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' }
      });

      // Log fuel log if provided
      if (fuelUsed) {
        await tx.fuelLog.create({
          data: {
            vehicleId: trip.vehicleId,
            fuelVolume: parseFloat(fuelUsed),
            cost: parseFloat(fuelUsed) * 3.5, // Estimated cost
            odometerReading: finalOdometer ? parseFloat(finalOdometer) : null,
            loggedAt: new Date()
          }
        });
      }

      return { status: 200, data: updatedTrip };
    });

    if (result.status !== 200) {
      return res.status(result.status).json(result.data);
    }

    res.status(200).json({
      id: result.data.id,
      tripNumber: result.data.tripNumber,
      status: 'Completed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/cancel
 */
export const cancelTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id }
      });

      if (!trip) {
        return { status: 404, data: { message: 'Trip not found' } };
      }

      if (trip.status === 'COMPLETED') {
        return { status: 400, data: { errorCode: 'VALIDATION_ERROR', message: 'Cannot cancel a completed trip' } };
      }

      const updatedTrip = await tx.trip.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // Release vehicle and driver back to Available
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'ACTIVE' }
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' }
      });

      return { status: 200, data: updatedTrip };
    });

    if (result.status !== 200) {
      return res.status(result.status).json(result.data);
    }

    res.status(200).json({
      id: result.data.id,
      tripNumber: result.data.tripNumber,
      status: 'Cancelled'
    });
  } catch (error) {
    next(error);
  }
};
