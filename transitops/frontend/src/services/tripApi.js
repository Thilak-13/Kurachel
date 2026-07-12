import tripsMock from '../mocks/trips.json';

const TRIPS_KEY = 'transitops_trips';
const VEHICLES_KEY = 'transitops_vehicles';
const DRIVERS_KEY = 'transitops_drivers';
const MAINTENANCE_KEY = 'transitops_maintenance';
const FUEL_LOGS_KEY = 'transitops_fuel_logs';
const EXPENSES_KEY = 'transitops_expenses';

// Initialization helpers
function getStoredTrips() {
  const stored = localStorage.getItem(TRIPS_KEY);
  if (!stored) {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(tripsMock));
    return tripsMock;
  }
  try { return JSON.parse(stored); } catch (e) { return tripsMock; }
}

function setStoredTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

function getStoredMaintenance() {
  const stored = localStorage.getItem(MAINTENANCE_KEY);
  const defaultMaintenance = [
    { id: 'm1', vehicleId: 'v2', type: 'Routine', description: 'Oil change and tire rotation', status: 'Open', openedDate: '2026-07-10', closedDate: '', remarks: '' },
    { id: 'm2', vehicleId: 'v1', type: 'Inspection', description: 'Annual safety inspection', status: 'Closed', openedDate: '2026-07-05', closedDate: '2026-07-06', remarks: 'Passed inspection.' }
  ];
  if (!stored) {
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(defaultMaintenance));
    return defaultMaintenance;
  }
  try { return JSON.parse(stored); } catch (e) { return defaultMaintenance; }
}

function setStoredMaintenance(logs) {
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(logs));
}

function getStoredFuelLogs() {
  const stored = localStorage.getItem(FUEL_LOGS_KEY);
  const defaultFuelLogs = [
    { id: 'f1', vehicleId: 'v1', tripId: 't2', quantity: 45.2, cost: 165.5, station: 'Texaco Houston', date: '2026-07-10', notes: 'Tank refueled before departure' }
  ];
  if (!stored) {
    localStorage.setItem(FUEL_LOGS_KEY, JSON.stringify(defaultFuelLogs));
    return defaultFuelLogs;
  }
  try { return JSON.parse(stored); } catch (e) { return defaultFuelLogs; }
}

function setStoredFuelLogs(logs) {
  localStorage.setItem(FUEL_LOGS_KEY, JSON.stringify(logs));
}

function getStoredExpenses() {
  const stored = localStorage.getItem(EXPENSES_KEY);
  const defaultExpenses = [
    { id: 'e1', tripId: 't3', category: 'Tolls', amount: 35.0, description: 'Highway tolls across state lines', date: '2026-07-10' }
  ];
  if (!stored) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(defaultExpenses));
    return defaultExpenses;
  }
  try { return JSON.parse(stored); } catch (e) { return defaultExpenses; }
}

function setStoredExpenses(logs) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(logs));
}

// Service Functions

export async function getTrips() {
  console.log('[API] getTrips');
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredTrips()), 150);
  });
}

export async function fetchTrips() {
  return getTrips();
}

export async function createTrip(tripData) {
  console.log('[API] createTrip', tripData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const newTrip = {
        id: `t_${Date.now()}`,
        ...tripData,
        cargoWeight: Number(tripData.cargoWeight),
        plannedDistance: Number(tripData.plannedDistance),
        status: 'Draft'
      };
      
      // Update vehicle and driver status to On Trip if instantly dispatched, but form creates "Draft"
      trips.push(newTrip);
      setStoredTrips(trips);
      resolve(newTrip);
    }, 150);
  });
}

export async function dispatchTrip(id) {
  console.log('[API] dispatchTrip', id);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const tripIndex = trips.findIndex(t => t.id === id);
      if (tripIndex === -1) {
        reject(new Error('Trip not found'));
        return;
      }
      
      trips[tripIndex].status = 'Dispatched';
      setStoredTrips(trips);

      // Mark the assigned vehicle and driver as 'On Trip'
      const { vehicleId, driverId } = trips[tripIndex];
      
      // Vehicle
      const storedVehicles = localStorage.getItem(VEHICLES_KEY);
      if (storedVehicles) {
        try {
          const vehicles = JSON.parse(storedVehicles);
          const vIndex = vehicles.findIndex(v => v.id === vehicleId);
          if (vIndex !== -1) {
            vehicles[vIndex].status = 'On Trip';
            localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
          }
        } catch(e) {}
      }

      // Driver
      const storedDrivers = localStorage.getItem(DRIVERS_KEY);
      if (storedDrivers) {
        try {
          const drivers = JSON.parse(storedDrivers);
          const dIndex = drivers.findIndex(d => d.id === driverId);
          if (dIndex !== -1) {
            drivers[dIndex].status = 'On Trip';
            localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
          }
        } catch(e) {}
      }

      resolve(trips[tripIndex]);
    }, 150);
  });
}

export async function completeTrip(id, { finalOdometer, fuelUsed, remarks }) {
  console.log('[API] completeTrip', id, { finalOdometer, fuelUsed, remarks });
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const tripIndex = trips.findIndex(t => t.id === id);
      if (tripIndex === -1) {
        reject(new Error('Trip not found'));
        return;
      }

      trips[tripIndex].status = 'Completed';
      trips[tripIndex].remarks = remarks;
      setStoredTrips(trips);

      const { vehicleId, driverId } = trips[tripIndex];

      // Reset Vehicle back to Available and update odometer
      const storedVehicles = localStorage.getItem(VEHICLES_KEY);
      if (storedVehicles) {
        try {
          const vehicles = JSON.parse(storedVehicles);
          const vIndex = vehicles.findIndex(v => v.id === vehicleId);
          if (vIndex !== -1) {
            vehicles[vIndex].status = 'Available';
            if (finalOdometer) {
              vehicles[vIndex].odometer = Number(finalOdometer);
            }
            localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
          }
        } catch(e) {}
      }

      // Reset Driver back to Available
      const storedDrivers = localStorage.getItem(DRIVERS_KEY);
      if (storedDrivers) {
        try {
          const drivers = JSON.parse(storedDrivers);
          const dIndex = drivers.findIndex(d => d.id === driverId);
          if (dIndex !== -1) {
            drivers[dIndex].status = 'Available';
            localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
          }
        } catch(e) {}
      }

      // Create a fuel log automatically if fuelUsed is supplied
      if (fuelUsed) {
        const fuelLogs = getStoredFuelLogs();
        fuelLogs.push({
          id: `f_${Date.now()}`,
          vehicleId,
          tripId: id,
          quantity: Number(fuelUsed),
          cost: Number(fuelUsed) * 3.5, // estimate cost
          station: 'Self Service Depot',
          date: new Date().toISOString().split('T')[0],
          notes: remarks || 'Logged during trip completion'
        });
        setStoredFuelLogs(fuelLogs);
      }

      resolve(trips[tripIndex]);
    }, 150);
  });
}

export async function cancelTrip(id, reason) {
  console.log('[API] cancelTrip', id, reason);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const tripIndex = trips.findIndex(t => t.id === id);
      if (tripIndex === -1) {
        reject(new Error('Trip not found'));
        return;
      }

      trips[tripIndex].status = 'Cancelled';
      trips[tripIndex].cancelReason = reason;
      setStoredTrips(trips);

      const { vehicleId, driverId } = trips[tripIndex];

      // Release Vehicle to Available
      const storedVehicles = localStorage.getItem(VEHICLES_KEY);
      if (storedVehicles) {
        try {
          const vehicles = JSON.parse(storedVehicles);
          const vIndex = vehicles.findIndex(v => v.id === vehicleId);
          if (vIndex !== -1) {
            vehicles[vIndex].status = 'Available';
            localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
          }
        } catch(e) {}
      }

      // Release Driver to Available
      const storedDrivers = localStorage.getItem(DRIVERS_KEY);
      if (storedDrivers) {
        try {
          const drivers = JSON.parse(storedDrivers);
          const dIndex = drivers.findIndex(d => d.id === driverId);
          if (dIndex !== -1) {
            drivers[dIndex].status = 'Available';
            localStorage.setItem(DRIVERS_KEY, JSON.stringify(drivers));
          }
        } catch(e) {}
      }

      resolve(trips[tripIndex]);
    }, 150);
  });
}

export async function getAvailableVehicles() {
  console.log('[API] getAvailableVehicles');
  return new Promise((resolve) => {
    setTimeout(() => {
      const stored = localStorage.getItem(VEHICLES_KEY);
      if (stored) {
        try {
          const vehicles = JSON.parse(stored);
          resolve(vehicles.filter(v => v.status === 'Available'));
          return;
        } catch(e) {}
      }
      resolve([]);
    }, 150);
  });
}

export async function getAvailableDrivers() {
  console.log('[API] getAvailableDrivers');
  return new Promise((resolve) => {
    setTimeout(() => {
      const stored = localStorage.getItem(DRIVERS_KEY);
      if (stored) {
        try {
          const drivers = JSON.parse(stored);
          resolve(drivers.filter(d => d.status === 'Available'));
          return;
        } catch(e) {}
      }
      resolve([]);
    }, 150);
  });
}

// Maintenance Services
export async function getMaintenance() {
  console.log('[API] getMaintenance');
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredMaintenance()), 150);
  });
}

export async function createMaintenance(maintenanceData) {
  console.log('[API] createMaintenance', maintenanceData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const logs = getStoredMaintenance();
      const newLog = {
        id: `m_${Date.now()}`,
        ...maintenanceData,
        openedDate: new Date().toISOString().split('T')[0],
        closedDate: '',
        status: 'Open'
      };
      logs.push(newLog);
      setStoredMaintenance(logs);

      // Set vehicle status to In Shop
      const storedVehicles = localStorage.getItem(VEHICLES_KEY);
      if (storedVehicles) {
        try {
          const vehicles = JSON.parse(storedVehicles);
          const vIndex = vehicles.findIndex(v => v.id === maintenanceData.vehicleId);
          if (vIndex !== -1) {
            vehicles[vIndex].status = 'In Shop';
            localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
          }
        } catch(e) {}
      }

      resolve(newLog);
    }, 150);
  });
}

export async function closeMaintenance(id, remarks) {
  console.log('[API] closeMaintenance', id, remarks);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const logs = getStoredMaintenance();
      const idx = logs.findIndex(m => m.id === id);
      if (idx === -1) {
        reject(new Error('Maintenance record not found'));
        return;
      }

      logs[idx].status = 'Closed';
      logs[idx].closedDate = new Date().toISOString().split('T')[0];
      logs[idx].remarks = remarks;
      setStoredMaintenance(logs);

      // Set vehicle status back to Available
      const vehicleId = logs[idx].vehicleId;
      const storedVehicles = localStorage.getItem(VEHICLES_KEY);
      if (storedVehicles) {
        try {
          const vehicles = JSON.parse(storedVehicles);
          const vIndex = vehicles.findIndex(v => v.id === vehicleId);
          if (vIndex !== -1) {
            vehicles[vIndex].status = 'Available';
            localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
          }
        } catch(e) {}
      }

      resolve(logs[idx]);
    }, 150);
  });
}

// Fuel Logs Services
export async function getFuelLogs() {
  console.log('[API] getFuelLogs');
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredFuelLogs()), 150);
  });
}

export async function createFuelLog(fuelData) {
  console.log('[API] createFuelLog', fuelData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const logs = getStoredFuelLogs();
      const newLog = {
        id: `f_${Date.now()}`,
        ...fuelData,
        quantity: Number(fuelData.quantity),
        cost: Number(fuelData.cost),
      };
      logs.push(newLog);
      setStoredFuelLogs(logs);
      resolve(newLog);
    }, 150);
  });
}

// Expenses Services
export async function getExpenses() {
  console.log('[API] getExpenses');
  return new Promise((resolve) => {
    setTimeout(() => resolve(getStoredExpenses()), 150);
  });
}

export async function createExpense(expenseData) {
  console.log('[API] createExpense', expenseData);
  return new Promise((resolve) => {
    setTimeout(() => {
      const logs = getStoredExpenses();
      const newLog = {
        id: `e_${Date.now()}`,
        ...expenseData,
        amount: Number(expenseData.amount),
      };
      logs.push(newLog);
      setStoredExpenses(logs);
      resolve(newLog);
    }, 150);
  });
}

export async function updateTrip(id, tripData) {
  console.log('[API] updateTrip', id, tripData);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const idx = trips.findIndex(t => t.id === id);
      if (idx === -1) {
        reject(new Error('Trip not found'));
        return;
      }
      trips[idx] = { 
        ...trips[idx], 
        ...tripData,
        cargoWeight: Number(tripData.cargoWeight),
        plannedDistance: Number(tripData.plannedDistance),
      };
      setStoredTrips(trips);
      resolve(trips[idx]);
    }, 150);
  });
}

export async function deleteTrip(id) {
  console.log('[API] deleteTrip', id);
  return new Promise((resolve) => {
    setTimeout(() => {
      const trips = getStoredTrips();
      const filtered = trips.filter(t => t.id !== id);
      setStoredTrips(filtered);
      resolve({ success: true });
    }, 150);
  });
}

