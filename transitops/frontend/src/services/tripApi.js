// Trip API client wrapper
import tripsMock from '../mocks/trips.json';

const API_BASE = '/api/trips';

export async function getTrips() {
  console.log(`[API] Fetching trips (mock)`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tripsMock);
    }, 100);
  });
}

export async function fetchTrips() {
  return getTrips();
}

export async function createTrip(tripData) {
  console.log(`[API] Dispatching trip at ${API_BASE}`, tripData);
  const newTrip = { id: `t${Math.floor(Math.random() * 1000)}`, ...tripData, status: 'SCHEDULED' };
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(newTrip);
    }, 100);
  });
}
