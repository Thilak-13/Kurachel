import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { requirePermission } from '../middlewares/rbac.middleware.js';
import * as controller from '../controllers/report.controller.js';

const router = express.Router();

// GET /api/reports - Fetch full reporting stats (includes vehicle reports & fleet summaries)
router.get('/', verifyToken, requirePermission('report:view'), controller.getReports);

// GET /api/reports/operational - Fetch per-vehicle operational ROI and costs (as array)
router.get('/operational', verifyToken, requirePermission('report:view'), controller.getOperationalReportsOnly);

// GET /api/reports/summary - Fetch operational summary report
router.get('/summary', verifyToken, requirePermission('report:view'), controller.getReports);

// GET /api/reports/export - Dynamically generate and download CSV sheet
router.get('/export', verifyToken, requirePermission('report:view'), controller.exportReportsCsv);

export default router;
