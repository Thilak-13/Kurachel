// Driver API client wrapper

const API_BASE = '/api/drivers';

export async function fetchDrivers() {
  console.log(`[API] Fetching drivers from ${API_BASE}`);
  // Temporary mock fallback
  return [
    { id: 'd1', name: 'Jane Doe', licenseNumber: 'DL-987654', status: 'ACTIVE' }
  ];
}
