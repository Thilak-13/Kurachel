import vehiclesMock from '../mocks/vehicles.json';

const STORAGE_KEY = 'transitops_vehicles';

function getStoredVehicles() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehiclesMock));
    return vehiclesMock;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing stored vehicles, resetting storage', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehiclesMock));
    return vehiclesMock;
  }
}

function setStoredVehicles(vehicles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

export async function getVehicles() {
  console.log('[API] getVehicles');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredVehicles());
    }, 200);
  });
}

export async function fetchVehicles() {
  return getVehicles();
}

export async function createVehicle(vehicleData) {
  console.log('[API] createVehicle', vehicleData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const vehicles = getStoredVehicles();
      const newVehicle = {
        id: `v_${Date.now()}`,
        ...vehicleData,
        maxLoadCapacity: Number(vehicleData.maxLoadCapacity),
        odometer: Number(vehicleData.odometer),
        acquisitionCost: Number(vehicleData.acquisitionCost),
      };
      vehicles.push(newVehicle);
      setStoredVehicles(vehicles);
      resolve(newVehicle);
    }, 200);
  });
}

export async function updateVehicle(id, vehicleData) {
  console.log('[API] updateVehicle', id, vehicleData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const vehicles = getStoredVehicles();
      const index = vehicles.findIndex(v => v.id === id);
      if (index === -1) {
        reject(new Error('Vehicle not found'));
        return;
      }
      const updatedVehicle = {
        ...vehicles[index],
        ...vehicleData,
        maxLoadCapacity: Number(vehicleData.maxLoadCapacity),
        odometer: Number(vehicleData.odometer),
        acquisitionCost: Number(vehicleData.acquisitionCost),
      };
      vehicles[index] = updatedVehicle;
      setStoredVehicles(vehicles);
      resolve(updatedVehicle);
    }, 200);
  });
}

export async function deleteVehicle(id) {
  console.log('[API] deleteVehicle', id);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const vehicles = getStoredVehicles();
      const filtered = vehicles.filter(v => v.id !== id);
      if (vehicles.length === filtered.length) {
        reject(new Error('Vehicle not found'));
        return;
      }
      setStoredVehicles(filtered);
      resolve({ success: true, id });
    }, 200);
  });
}
