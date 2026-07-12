// Role-based Access Control (RBAC) middleware for Express
import rbac from '../../../shared/validators/rbac.js';

const { checkPermission } = rbac;

/**
 * Express middleware factory to enforce role-based permissions.
 * @param {string} action - The action string to validate (e.g., 'vehicle:create')
 * @returns {Function} Express middleware
 */
export const requirePermission = (action) => {
  return (req, res, next) => {
    // Dev 2's auth guard attaches decoded user payload with role to req.user
    const role = req.user?.role;

    if (!role) {
      return res.status(403).json({ 
        error: "FORBIDDEN", 
        message: "Role not permitted" 
      });
    }

    const isAllowed = checkPermission(role, action);
    if (!isAllowed) {
      return res.status(403).json({ 
        error: "FORBIDDEN", 
        message: "Role not permitted" 
      });
    }

    next();
  };
};
