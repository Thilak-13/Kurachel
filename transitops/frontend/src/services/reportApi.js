// Report API client wrapper

const API_BASE = '/api/reports';

export async function fetchDashboardStats() {
  console.log(`[API] Fetching dashboard stats from ${API_BASE}/dashboard-stats`);
  return {
    activeVehicles: 12,
    activeDrivers: 8,
    tripsScheduled: 34,
    maintenanceCount: 2
  };
}
