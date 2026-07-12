// Vehicle API client wrapper

const API_BASE = '/api/vehicles';

export async function fetchVehicles() {
  console.log(`[API] Fetching vehicles from ${API_BASE}`);
  // Temporary mock fallback
  return [
    { id: 'v1', licensePlate: 'TX-1234', make: 'Ford', model: 'Transit', status: 'ACTIVE', odometer: 45000 }
  ];
}

export async function createVehicle(vehicleData) {
  console.log(`[API] Creating vehicle at ${API_BASE}`, vehicleData);
  return { id: Math.random().toString(36).substr(2, 9), ...vehicleData };
}
