// Role-based Access Control (RBAC) rules
const { Roles } = require('../enums');

const PERMISSIONS = Object.freeze({
  // Vehicle actions
  'vehicle:create': [Roles.ADMIN],
  'vehicle:update': [Roles.ADMIN, Roles.DISPATCHER],
  'vehicle:delete': [Roles.ADMIN],
  'vehicle:view': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],

  // Driver actions
  'driver:create': [Roles.ADMIN],
  'driver:update': [Roles.ADMIN],
  'driver:delete': [Roles.ADMIN],
  'driver:view': [Roles.ADMIN, Roles.DISPATCHER],

  // Trip actions
  'trip:create': [Roles.ADMIN, Roles.DISPATCHER],
  'trip:dispatch': [Roles.ADMIN, Roles.DISPATCHER],
  'trip:complete': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],
  'trip:cancel': [Roles.ADMIN, Roles.DISPATCHER],
  'trip:delete': [Roles.ADMIN],
  'trip:view': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],

  // Maintenance actions
  'maintenance:create': [Roles.ADMIN, Roles.DISPATCHER],
  'maintenance:update': [Roles.ADMIN, Roles.DISPATCHER],
  'maintenance:view': [Roles.ADMIN, Roles.DISPATCHER],

  // Fuel log actions
  'fuel-log:create': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],
  'fuel-log:view': [Roles.ADMIN, Roles.DISPATCHER],

  // Expense actions
  'expense:create': [Roles.ADMIN, Roles.DISPATCHER, Roles.DRIVER],
  'expense:view': [Roles.ADMIN, Roles.DISPATCHER],

  // Reports / Dashboard actions
  'report:view': [Roles.ADMIN, Roles.DISPATCHER],
  'dashboard:view': [Roles.ADMIN, Roles.DISPATCHER],
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
