// Driver API client wrapper
import driversMock from '../mocks/drivers.json';

const API_BASE = '/api/drivers';

export async function getDrivers() {
  console.log(`[API] Fetching drivers (mock)`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(driversMock);
    }, 100);
  });
}

export async function fetchDrivers() {
  return getDrivers();
}
