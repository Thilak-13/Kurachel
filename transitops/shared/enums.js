// Shared Enums for TransitOps

const VehicleStatus = {
  ACTIVE: 'ACTIVE',
  IN_MAINTENANCE: 'IN_MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
};

const DriverStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_TRIP: 'ON_TRIP',
  ON_BREAK: 'ON_BREAK',
};

const TripStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const Roles = {
  ADMIN: 'ADMIN',
  DISPATCHER: 'DISPATCHER',
  DRIVER: 'DRIVER',
};

module.exports = {
  VehicleStatus,
  DriverStatus,
  TripStatus,
  Roles,
};
