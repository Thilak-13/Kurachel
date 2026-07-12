// Vehicle API client wrapper
import vehiclesMock from '../mocks/vehicles.json';

const API_BASE = '/api/vehicles';

export async function getVehicles() {
  console.log(`[API] Fetching vehicles (mock)`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(vehiclesMock);
    }, 100);
  });
}

export async function fetchVehicles() {
  return getVehicles();
}

export async function createVehicle(vehicleData) {
  console.log(`[API] Creating vehicle at ${API_BASE}`, vehicleData);
  const newVehicle = { id: `v${Math.floor(Math.random() * 1000)}`, ...vehicleData };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(newVehicle);
    }, 100);
  });
}
