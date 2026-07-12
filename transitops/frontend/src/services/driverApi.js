import driversMock from '../mocks/drivers.json';

const STORAGE_KEY = 'transitops_drivers';

function getStoredDrivers() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(driversMock));
    return driversMock;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing stored drivers, resetting storage', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(driversMock));
    return driversMock;
  }
}

function setStoredDrivers(drivers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
}

export async function getDrivers() {
  console.log('[API] getDrivers');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredDrivers());
    }, 200);
  });
}

export async function fetchDrivers() {
  return getDrivers();
}

export async function createDriver(driverData) {
  console.log('[API] createDriver', driverData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const drivers = getStoredDrivers();
      const newDriver = {
        id: `d_${Date.now()}`,
        ...driverData,
        safetyScore: Number(driverData.safetyScore),
      };
      drivers.push(newDriver);
      setStoredDrivers(drivers);
      resolve(newDriver);
    }, 200);
  });
}

export async function updateDriver(id, driverData) {
  console.log('[API] updateDriver', id, driverData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const drivers = getStoredDrivers();
      const index = drivers.findIndex(d => d.id === id);
      if (index === -1) {
        reject(new Error('Driver not found'));
        return;
      }
      const updatedDriver = {
        ...drivers[index],
        ...driverData,
        safetyScore: Number(driverData.safetyScore),
      };
      drivers[index] = updatedDriver;
      setStoredDrivers(drivers);
      resolve(updatedDriver);
    }, 200);
  });
}

export async function deleteDriver(id) {
  console.log('[API] deleteDriver', id);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const drivers = getStoredDrivers();
      const filtered = drivers.filter(d => d.id !== id);
      if (drivers.length === filtered.length) {
        reject(new Error('Driver not found'));
        return;
      }
      setStoredDrivers(filtered);
      resolve({ success: true, id });
    }, 200);
  });
}
