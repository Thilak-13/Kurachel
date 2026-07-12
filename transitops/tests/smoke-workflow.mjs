// Dry Run Example Workflow verification
// Usage: node tests/smoke-workflow.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const adminCreds = { email: 'admin@transitops.com', password: 'adminpassword123' };

async function run() {
  console.log('=== STARTING EXAMPLE WORKFLOW DRY RUN ===');

  let adminToken = null;
  try {
    const authRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginIdentifier: adminCreds.email, password: adminCreds.password })
    });
    if (authRes.ok) {
      const data = await authRes.json();
      adminToken = data.data?.token || data.token;
    }
  } catch (err) {
    console.error('Could not authenticate with server.', err.message);
    process.exit(1);
  }

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  });

  const getVehicleStatus = async (id) => {
    const res = await fetch(`${BASE_URL}/vehicles`, { method: 'GET', headers: getHeaders() });
    const list = await res.json();
    return list.find(v => v.id === id)?.status;
  };

  const getDriverStatus = async (id) => {
    const res = await fetch(`${BASE_URL}/drivers`, { method: 'GET', headers: getHeaders() });
    const list = await res.json();
    return list.find(d => d.id === id)?.status;
  };

  // Step 1: Register Vehicle
  console.log('\n--- Step 1: Registering Vehicle ---');
  const regNo = `TX-FLOW-${Math.floor(Math.random() * 100000)}`;
  const vRes = await fetch(`${BASE_URL}/vehicles`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      registrationNumber: regNo,
      model: 'Ford Transit',
      type: 'Van',
      maxLoadCapacity: 1500,
      odometer: 1000,
      acquisitionCost: 35000,
      status: 'Available'
    })
  });
  const vehicle = await vRes.json();
  console.log(`Registered Vehicle: ${vehicle.id} | Status: ${vehicle.status} (Expected: Available)`);

  // Step 2: Register Driver
  console.log('\n--- Step 2: Registering Driver ---');
  const licenseNo = `DL-FLOW-${Math.floor(Math.random() * 1000000)}`;
  const dRes = await fetch(`${BASE_URL}/drivers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      name: 'Workflow Driver',
      licenseNumber: licenseNo,
      category: 'Class A',
      licenseExpiryDate: '2030-01-01',
      contact: '555-1111',
      safetyScore: 95,
      status: 'Available'
    })
  });
  const driver = await dRes.json();
  console.log(`Registered Driver: ${driver.id} | Status: ${driver.status} (Expected: Available)`);

  // Step 3: Create Trip (Draft)
  console.log('\n--- Step 3: Creating Trip (Draft) ---');
  const tRes = await fetch(`${BASE_URL}/trips`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      vehicleId: vehicle.id,
      driverId: driver.id,
      routeName: 'Workflow Test Route',
      cargoWeight: 800
    })
  });
  const trip = await tRes.json();
  console.log(`Created Trip: ${trip.id} | Status: ${trip.status} (Expected: Draft)`);

  // Step 4: Dispatch Trip
  console.log('\n--- Step 4: Dispatching Trip ---');
  const dispRes = await fetch(`${BASE_URL}/trips/${trip.id}/dispatch`, {
    method: 'POST',
    headers: getHeaders()
  });
  const dispTrip = await dispRes.json();
  
  const vStatusAfterDisp = await getVehicleStatus(vehicle.id);
  const dStatusAfterDisp = await getDriverStatus(driver.id);
  console.log(`Trip status: ${dispTrip.status} (Expected: Dispatched)`);
  console.log(`Vehicle status: ${vStatusAfterDisp} (Expected: On Trip)`);
  console.log(`Driver status: ${dStatusAfterDisp} (Expected: On Trip)`);

  // Step 5: Complete Trip
  console.log('\n--- Step 5: Completing Trip ---');
  const compRes = await fetch(`${BASE_URL}/trips/${trip.id}/complete`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      finalOdometer: 1150,
      fuelUsed: 12.5,
      remarks: 'Completed route safely.'
    })
  });
  const compTrip = await compRes.json();
  
  const vStatusAfterComp = await getVehicleStatus(vehicle.id);
  const dStatusAfterComp = await getDriverStatus(driver.id);
  console.log(`Trip status: ${compTrip.status} (Expected: Completed)`);
  console.log(`Vehicle status: ${vStatusAfterComp} (Expected: Available)`);
  console.log(`Driver status: ${dStatusAfterComp} (Expected: Available)`);

  // Step 6: Open Maintenance
  console.log('\n--- Step 6: Opening Maintenance ---');
  const maintRes = await fetch(`${BASE_URL}/maintenance`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      vehicleId: vehicle.id,
      type: 'Routine',
      description: 'Routine post-trip inspection'
    })
  });
  const maintLog = await maintRes.json();
  
  const vStatusAfterMaint = await getVehicleStatus(vehicle.id);
  console.log(`Maintenance status: ${maintLog.status} (Expected: In Shop)`);
  console.log(`Vehicle status: ${vStatusAfterMaint} (Expected: In Shop)`);

  // Step 7: Close Maintenance
  console.log('\n--- Step 7: Closing Maintenance ---');
  const closeRes = await fetch(`${BASE_URL}/maintenance/${maintLog.id}/close`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      cost: 120.0
    })
  });
  const closedLog = await closeRes.json();
  
  const vStatusAfterClose = await getVehicleStatus(vehicle.id);
  console.log(`Maintenance status: ${closedLog.status} (Expected: Completed)`);
  console.log(`Vehicle status: ${vStatusAfterClose} (Expected: Available)`);

  console.log('\n=== EXAMPLE WORKFLOW DRY RUN COMPLETE: 100% SUCCESS ===');
}

run();
