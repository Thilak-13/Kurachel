// Trip API client wrapper

const API_BASE = '/api/trips';

export async function fetchTrips() {
  console.log(`[API] Fetching trips from ${API_BASE}`);
  // Temporary mock fallback
  return [
    { id: 't1', routeName: 'Route 42 - Downtown Express', vehicleId: 'v1', driverId: 'd2', status: 'IN_PROGRESS' }
  ];
}

export async function createTrip(tripData) {
  console.log(`[API] Dispatching trip at ${API_BASE}`, tripData);
  return { id: Math.random().toString(36).substr(2, 9), ...tripData };
}
