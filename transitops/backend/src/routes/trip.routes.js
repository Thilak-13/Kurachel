import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import { tripValidator, tripCompleteValidator } from '../validators/trip.validator.js';
import * as controller from '../controllers/trip.controller.js';

const router = express.Router();

// GET /api/trips - List all trips
router.get('/', verifyToken, requirePermission('trip:view'), controller.getTrips);

// GET /api/trips/:id - Get details of a specific trip
router.get('/:id', verifyToken, requirePermission('trip:view'), controller.getTripById);

// POST /api/trips - Create a new trip (initially Draft status)
router.post('/', verifyToken, requirePermission('trip:create'), tripValidator, controller.createTrip);

// POST /api/trips/:id/dispatch - Dispatch a trip (marks vehicle, driver, and trip en route)
router.post('/:id/dispatch', verifyToken, requirePermission('trip:dispatch'), controller.dispatchTrip);

// POST /api/trips/:id/complete - Complete a trip (logs final odometer and releases vehicle/driver)
router.post('/:id/complete', verifyToken, requirePermission('trip:complete'), tripCompleteValidator, controller.completeTrip);

// POST /api/trips/:id/cancel - Cancel an active dispatched trip (releases vehicle/driver)
router.post('/:id/cancel', verifyToken, requirePermission('trip:cancel'), controller.cancelTrip);

export default router;
