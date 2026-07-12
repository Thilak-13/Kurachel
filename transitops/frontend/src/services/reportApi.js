// Report API client wrapper
import dashboardMock from '../mocks/dashboard.json';
import reportsMock from '../mocks/reports.json';

const API_BASE = '/api/reports';

export async function getDashboard() {
  console.log(`[API] Fetching dashboard stats (mock)`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dashboardMock);
    }, 100);
  });
}

export async function getDashboardStats() {
  return getDashboard();
}

export async function fetchDashboardStats() {
  return getDashboard();
}

export async function getReportData() {
  console.log(`[API] Fetching reports data (mock)`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(reportsMock);
    }, 100);
  });
}
