import dashboardMock from '../mocks/dashboard.json';
import reportsMock from '../mocks/reports.json';

// ─────────────────────────────────────────────
// Dashboard API
// ─────────────────────────────────────────────

/**
 * Fetch dashboard KPIs and chart data.
 * Optionally accepts filter params (vehicleType, vehicleStatus, region).
 * Backend owns all aggregation — frontend just passes params.
 */
export async function getDashboard(filters = {}) {
  console.log('[API] getDashboard', filters);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate filter-aware response (backend would filter server-side)
      resolve({ ...dashboardMock });
    }, 200);
  });
}

export const getDashboardStats = getDashboard;
export const fetchDashboardStats = getDashboard;

// ─────────────────────────────────────────────
// Reports API
// ─────────────────────────────────────────────

/**
 * Fetch full report data including vehicle rows, highlights and chart data.
 * Accepts filters: { vehicle, dateFrom, dateTo, vehicleType, status }
 */
export async function getReportData(filters = {}) {
  console.log('[API] getReportData', filters);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate filter (backend would filter server-side)
      let rows = [...reportsMock.vehicleReports];

      if (filters.vehicle) {
        rows = rows.filter(r =>
          r.registrationNumber.toLowerCase().includes(filters.vehicle.toLowerCase()) ||
          r.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase())
        );
      }

      resolve({
        ...reportsMock,
        vehicleReports: rows,
      });
    }, 200);
  });
}

/**
 * Export report as CSV.
 * Tries backend CSV endpoint first; falls back to client-side generation.
 */
export async function exportReportCSV(rows) {
  const headers = [
    'Vehicle', 'Registration Number', 'Distance (mi)', 'Fuel Consumed (gal)',
    'Fuel Efficiency (mpg)', 'Fuel Cost ($)', 'Maintenance Cost ($)',
    'Operational Cost ($)', 'Revenue ($)', 'ROI (%)'
  ];

  const csvRows = rows.map(r => [
    r.vehicle,
    r.registrationNumber,
    r.distanceTravelled,
    r.fuelConsumed,
    r.fuelEfficiency,
    r.fuelCost,
    r.maintenanceCost,
    r.operationalCost,
    r.revenue,
    r.roi,
  ]);

  const csvContent = [headers, ...csvRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'TransitOps_Report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
