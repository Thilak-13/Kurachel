import * as reportService from '../services/report.service.js';

/**
 * GET /api/reports
 * Retrieve operational report summary and detailed per-vehicle statistics.
 */
export const getReports = async (req, res, next) => {
  try {
    const vehicleReports = await reportService.getOperationalReports(req.query);
    const fleetSummary = reportService.getFleetSummary(vehicleReports);
    
    res.status(200).json({
      vehicleReports,
      fleetSummary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/operational
 * Alias route supporting /api/reports/operational expected by standard API contracts.
 */
export const getOperationalReportsOnly = async (req, res, next) => {
  try {
    const reports = await reportService.getOperationalReports(req.query);
    res.status(200).json(reports);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reports/export
 * Download dynamically generated CSV reports sheet.
 */
export const exportReportsCsv = async (req, res, next) => {
  try {
    const csvContent = await reportService.generateReportsCsv(req.query);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=kurachel-operational-report.csv');
    
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
