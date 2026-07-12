import * as dashboardService from '../services/dashboard.service.js';

/**
 * GET /api/dashboard
 * Retrieve operations dashboard metrics and active filter options.
 */
export const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
