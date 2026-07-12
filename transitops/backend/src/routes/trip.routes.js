import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import * as controller from '../controllers/trip.controller.js';

const router = express.Router();

// GET /api/trips
router.get('/', verifyToken, requirePermission('trip:view'), controller.getTrips);

// POST /api/trips
router.post('/', verifyToken, requirePermission('trip:create'), controller.createTrip);

// POST /api/trips/:id/dispatch
router.post('/:id/dispatch', verifyToken, requirePermission('trip:dispatch'), controller.dispatchTrip);

// POST /api/trips/:id/complete
router.post('/:id/complete', verifyToken, requirePermission('trip:complete'), controller.completeTrip);

// POST /api/trips/:id/cancel
router.post('/:id/cancel', verifyToken, requirePermission('trip:cancel'), controller.cancelTrip);

export default router;
