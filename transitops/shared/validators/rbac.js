// Role-based Access Control (RBAC) rules
const { Roles } = require('../enums');

const PERMISSIONS = {
  // Vehicles
  'vehicle:create': [Roles.ADMIN],
  'vehicle:update': [Roles.ADMIN, Roles.DISPATCHER],
  'vehicle:delete': [Roles.ADMIN],
  'vehicle:view': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],

  // Drivers
  'driver:create': [Roles.ADMIN],
  'driver:update': [Roles.ADMIN],
  'driver:delete': [Roles.ADMIN],
  'driver:view': [Roles.ADMIN, Roles.DISPATCHER],

  // Trips
  'trip:create': [Roles.ADMIN, Roles.DISPATCHER],
  'trip:update': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],
  'trip:delete': [Roles.ADMIN],
  'trip:view': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],

  // Maintenance
  'maintenance:create': [Roles.ADMIN, Roles.DISPATCHER],
  'maintenance:update': [Roles.ADMIN, Roles.DISPATCHER],
  'maintenance:view': [Roles.ADMIN, Roles.DISPATCHER],

  // Reports
  'report:view': [Roles.ADMIN, Roles.DISPATCHER],
};

/**
 * Checks if a user role has permission to perform an action.
 * @param {string} role - The user's role
 * @param {string} action - The action to check
 * @returns {boolean}
 */
function checkPermission(role, action) {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

module.exports = {
  checkPermission,
  PERMISSIONS,
};
