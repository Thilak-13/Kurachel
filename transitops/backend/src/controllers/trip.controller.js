import * as tripService from '../services/trip.service.js';

/**
 * GET /api/trips
 * Retrieve all trips with filtering, search, pagination, and sorting.
 */
export const getTrips = async (req, res, next) => {
  try {
    const { trips } = await tripService.getTrips(req.query);
    res.status(200).json(trips);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/trips/:id
 * Retrieve specific trip details.
 */
export const getTripById = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id);
    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips
 * Create a new Trip (Draft status).
 */
export const createTrip = async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body);
    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/dispatch
 * Dispatch a trip (marks vehicle/driver/trip as en route).
 */
export const dispatchTrip = async (req, res, next) => {
  try {
    const trip = await tripService.dispatchTrip(req.params.id);
    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/complete
 * Complete a trip (logs final odometer, releases driver/vehicle).
 */
export const completeTrip = async (req, res, next) => {
  try {
    const trip = await tripService.completeTrip(req.params.id, req.body);
    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/cancel
 * Cancel a trip (releases driver/vehicle).
 */
export const cancelTrip = async (req, res, next) => {
  try {
    const trip = await tripService.cancelTrip(req.params.id);
    res.status(200).json(trip);
  } catch (error) {
    next(error);
  }
};
