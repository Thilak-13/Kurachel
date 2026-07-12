// Shared Enums for TransitOps - Single Source of Truth
// Exported with Object.freeze to prevent mutation.

const VehicleStatus = Object.freeze({
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
});

const DriverStatus = Object.freeze({
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  SUSPENDED: 'Suspended',
  OFF_DUTY: 'Off Duty',
});

const TripStatus = Object.freeze({
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

const Roles = Object.freeze({
  ADMIN: 'Admin',
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  DRIVER: 'Driver',
  MAINTENANCE_MANAGER: 'Maintenance Manager',
});

module.exports = Object.freeze({
  VehicleStatus,
  DriverStatus,
  TripStatus,
  Roles,
});
