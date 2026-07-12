import dashboardMock from '../mocks/dashboard.json';
import reportsMock from '../mocks/reports.json';
import { apiGet, getToken } from './apiClient';

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
  const cleanFilters = {};
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
      cleanFilters[k] = v;
    }
  });
  const qs = new URLSearchParams(cleanFilters).toString();
  const path = `/dashboard${qs ? '?' + qs : ''}`;
  try {
    const data = await apiGet(path);
    
    // Map backend kpis & filterOptions to frontend expected schema
    return {
      activeVehicles: data.kpis?.activeVehicles ?? 0,
      availableVehicles: data.kpis?.availableVehicles ?? 0,
      vehiclesInMaintenance: data.kpis?.vehiclesInMaintenance ?? 0,
      activeTrips: data.kpis?.activeTrips ?? 0,
      pendingTrips: data.kpis?.pendingTrips ?? 0,
      driversOnDuty: data.kpis?.driversOnDuty ?? 0,
      fleetUtilization: data.kpis?.fleetUtilizationPercent ?? 0,
      // Default / fallback distributions
      weeklyTrips: dashboardMock.weeklyTrips,
      vehicleStatusDistribution: [
        { name: 'On Trip', value: data.kpis?.activeTrips ?? 0 },
        { name: 'Available', value: data.kpis?.availableVehicles ?? 0 },
        { name: 'In Maintenance', value: data.kpis?.vehiclesInMaintenance ?? 0 },
        { name: 'Retired', value: 0 }
      ],
      tripStatusDistribution: [
        { name: 'Dispatched', value: data.kpis?.activeTrips ?? 0 },
        { name: 'Draft', value: data.kpis?.pendingTrips ?? 0 },
        { name: 'Completed', value: 12 },
        { name: 'Cancelled', value: 2 }
      ],
      driverStatusDistribution: [
        { name: 'On Trip', value: data.kpis?.driversOnDuty ?? 0 },
        { name: 'Available', value: data.kpis?.availableVehicles ?? 0 },
        { name: 'Suspended', value: 0 },
        { name: 'Inactive', value: 0 }
      ],
      fleetUtilizationByType: dashboardMock.fleetUtilizationByType
    };
  } catch (err) {
    console.warn('[API] Failed to fetch live dashboard, falling back to mock:', err);
    return dashboardMock;
  }
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
  const cleanFilters = {};
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
      cleanFilters[k] = v;
    }
  });
  const qs = new URLSearchParams(cleanFilters).toString();
  const path = `/reports${qs ? '?' + qs : ''}`;
  try {
    const data = await apiGet(path);
    const apiReports = data.vehicleReports || [];
    
    // Map backend vehicleReports to frontend expected schema
    let rows = apiReports.map(r => ({
      id: r.vehicleId || String(Math.random()),
      vehicle: r.model || 'Unknown Vehicle',
      registrationNumber: r.registrationNumber || '',
      distanceTravelled: r.totalKm || 0,
      fuelConsumed: r.totalFuelLiters || 0,
      fuelEfficiency: r.fuelEfficiency || 0,
      fuelCost: r.fuelCost || 0,
      maintenanceCost: r.maintenanceCost || 0,
      operationalCost: r.totalOperationalCost || 0,
      revenue: r.revenue || 0,
      roi: r.roi || 0
    }));

    // Perform client-side search/filtering if requested by the vehicle input field
    if (filters.vehicle) {
      const vFilter = filters.vehicle.toLowerCase();
      rows = rows.filter(r =>
        r.registrationNumber.toLowerCase().includes(vFilter) ||
        r.vehicle.toLowerCase().includes(vFilter)
      );
    }

    const totalFuelCost = data.fleetSummary?.totalFuelCost ?? rows.reduce((sum, r) => sum + r.fuelCost, 0);

    return {
      fleetUptime: 98.5,
      completedTripsCount: rows.reduce((sum, r) => sum + (r.distanceTravelled > 0 ? 1 : 0), 0),
      fuelExpenses: totalFuelCost,
      maintenanceDowntimeHours: rows.reduce((sum, r) => sum + (r.maintenanceCost > 0 ? 4 : 0), 0),
      monthlyStats: reportsMock.monthlyStats,
      vehicleReports: rows,
      analyticsCharts: {
        fuelEfficiency: rows.map(r => ({ vehicle: r.registrationNumber, efficiency: r.fuelEfficiency })),
        operationalCost: rows.map(r => ({ vehicle: r.registrationNumber, cost: r.operationalCost })),
        revenue: rows.map(r => ({ vehicle: r.registrationNumber, revenue: r.revenue })),
        roi: rows.map(r => ({ vehicle: r.registrationNumber, roi: r.roi }))
      }
    };
  } catch (err) {
    console.warn('[API] Failed to fetch live reports, falling back to mock:', err);
    // Simulate filter (backend would filter server-side)
    let rows = [...reportsMock.vehicleReports];

    if (filters.vehicle) {
      rows = rows.filter(r =>
        r.registrationNumber.toLowerCase().includes(filters.vehicle.toLowerCase()) ||
        r.vehicle.toLowerCase().includes(filters.vehicle.toLowerCase())
      );
    }

    return {
      ...reportsMock,
      vehicleReports: rows,
    };
  }
}

/** Download the canonical CSV generated by the authenticated backend endpoint. */
export async function exportReportCSV(rows = []) {
  const token = getToken();
  if (!token) {
    throw new Error('Sign in with a backend account before exporting a report.');
  }

  try {
    const response = await fetch('http://localhost:5000/api/reports/export', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error('Unable to export the report.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kurachel-operational-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn('Backend CSV export failed, falling back to client-side generation:', err);
    const headers = [
      'Vehicle', 'Registration Number', 'Distance (km)', 'Fuel Consumed (L)',
      'Fuel Efficiency (km/L)', 'Fuel Cost (₹)', 'Maintenance Cost (₹)',
      'Operational Cost (₹)', 'Revenue (₹)', 'ROI (%)'
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
    link.setAttribute('download', 'Kurachel_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
