// Role-based Access Control (RBAC) rules
const { Roles } = require('../enums');

const PERMISSIONS = Object.freeze({
  // Vehicle actions
  'vehicle:create': [Roles.ADMIN, Roles.FLEET_MANAGER],
  'vehicle:update': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.DISPATCHER],
  'vehicle:delete': [Roles.ADMIN, Roles.FLEET_MANAGER],
  'vehicle:view': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.DISPATCHER, Roles.DRIVER],

  // Driver actions
  'driver:create': [Roles.ADMIN, Roles.FLEET_MANAGER],
  'driver:update': [Roles.ADMIN, Roles.FLEET_MANAGER],
  'driver:delete': [Roles.ADMIN, Roles.FLEET_MANAGER],
  'driver:view': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.DISPATCHER],

  // Trip actions
  'trip:create': [Roles.ADMIN, Roles.DISPATCHER],
  'trip:dispatch': [Roles.ADMIN, Roles.DISPATCHER],
  'trip:complete': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],
  'trip:cancel': [Roles.ADMIN, Roles.DISPATCHER],
  'trip:delete': [Roles.ADMIN],
  'trip:view': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],

  // Maintenance actions
  'maintenance:create': [Roles.ADMIN, Roles.DISPATCHER, Roles.MAINTENANCE_MANAGER],
  'maintenance:update': [Roles.ADMIN, Roles.DISPATCHER, Roles.MAINTENANCE_MANAGER],
  'maintenance:view': [Roles.ADMIN, Roles.DISPATCHER, Roles.MAINTENANCE_MANAGER],

  // Fuel log actions
  'fuel-log:create': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.DISPATCHER, Roles.DRIVER, Roles.MAINTENANCE_MANAGER],
  'fuel-log:view': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.DISPATCHER, Roles.MAINTENANCE_MANAGER],

  // Expense actions
  'expense:create': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.DISPATCHER, Roles.DRIVER],
  'expense:view': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.DISPATCHER],

  // Reports / Dashboard actions
  'report:view': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.MAINTENANCE_MANAGER],
  'dashboard:view': [Roles.ADMIN, Roles.FLEET_MANAGER, Roles.DISPATCHER, Roles.MAINTENANCE_MANAGER],
});

/**
 * Checks if a user role has permission to perform an action.
 * @param {string} role - The user's role (e.g. 'Admin', 'Dispatcher', 'Driver')
 * @param {string} action - The action to check (e.g. 'vehicle:create')
 * @returns {boolean}
 */
function checkPermission(role, action) {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

module.exports = {
  PERMISSIONS,
  checkPermission,
};
