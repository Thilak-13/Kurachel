// Automated Trip Rejection-Path and Race Condition Smoke Tests
// Usage: node tests/smoke-trips.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const adminCreds = { email: 'admin@transitops.com', password: 'adminpassword123' };

async function run() {
  console.log('=== STARTING TRIP REJECTION AND RACE CONDITION TESTS ===');

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
    console.error('Could not authenticate with server. Is it running?', err.message);
    process.exit(1);
  }

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  });

  const logs = [];
  const logTest = (testName, endpoint, method, expectedStatus, actualStatus, pass, remarks) => {
    logs.push({ testName, endpoint, method, expectedStatus, actualStatus, status: pass ? 'PASS' : 'FAIL', remarks });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${method} ${endpoint} - ${testName} (Expected: ${expectedStatus}, Got: ${actualStatus})`);
  };

  // Helper to create a test vehicle
  const createTestVehicle = async (maxCapacity, status = 'Available') => {
    const regNo = `TX-TRIP-${Math.floor(Math.random() * 100000)}`;
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        registrationNumber: regNo,
        model: 'Toyota Dyna',
        type: 'Truck',
        maxLoadCapacity: maxCapacity,
        odometer: 100,
        acquisitionCost: 15000,
        status
      })
    });
    return await res.json();
  };

  // Helper to create a test driver
  const createTestDriver = async (expiryDate, status = 'Available') => {
    const licenseNo = `DL-TRIP-${Math.floor(Math.random() * 1000000)}`;
    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: 'Trip Tester',
        licenseNumber: licenseNo,
        category: 'Class A',
        licenseExpiryDate: expiryDate,
        contact: '555-4321',
        safetyScore: 90,
        status
      })
    });
    return await res.json();
  };

  // Helper to create a trip
  const createTestTrip = async (vehicleId, driverId, cargoWeight) => {
    const res = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        vehicleId,
        driverId,
        routeName: 'Test Route',
        cargoWeight
      })
    });
    return await res.json();
  };

  // 1. Dispatch with overweight cargo
  try {
    const v = await createTestVehicle(1000); // Max capacity 1000kg
    const d = await createTestDriver('2030-01-01'); // Valid license
    const trip = await createTestTrip(v.id, d.id, 1500); // 1500kg cargo (overweight)

    const res = await fetch(`${BASE_URL}/trips/${trip.id}/dispatch`, {
      method: 'POST',
      headers: getHeaders()
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest(
      'Dispatch with overweight cargo',
      `/trips/:id/dispatch`,
      'POST',
      400,
      res.status,
      res.status === 400 && data.errorCode === 'VALIDATION_ERROR',
      data.message || 'No error message returned'
    );
  } catch (err) {
    logTest('Dispatch with overweight cargo', '/trips/:id/dispatch', 'POST', 400, 'ERR_CONN', false, err.message);
  }

  // 2. Dispatch with a Suspended driver
  try {
    const v = await createTestVehicle(2000);
    const d = await createTestDriver('2030-01-01', 'Suspended'); // Suspended
    const trip = await createTestTrip(v.id, d.id, 500);

    const res = await fetch(`${BASE_URL}/trips/${trip.id}/dispatch`, {
      method: 'POST',
      headers: getHeaders()
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest(
      'Dispatch with Suspended driver',
      `/trips/:id/dispatch`,
      'POST',
      400,
      res.status,
      res.status === 400 && data.errorCode === 'VALIDATION_ERROR',
      data.message || 'No error message returned'
    );
  } catch (err) {
    logTest('Dispatch with Suspended driver', '/trips/:id/dispatch', 'POST', 400, 'ERR_CONN', false, err.message);
  }

  // 3. Dispatch with an expired license
  try {
    const v = await createTestVehicle(2000);
    const d = await createTestDriver('2020-01-01'); // Expired back in 2020
    const trip = await createTestTrip(v.id, d.id, 500);

    const res = await fetch(`${BASE_URL}/trips/${trip.id}/dispatch`, {
      method: 'POST',
      headers: getHeaders()
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest(
      'Dispatch with expired license',
      `/trips/:id/dispatch`,
      'POST',
      400,
      res.status,
      res.status === 400 && data.errorCode === 'VALIDATION_ERROR',
      data.message || 'No error message returned'
    );
  } catch (err) {
    logTest('Dispatch with expired license', '/trips/:id/dispatch', 'POST', 400, 'ERR_CONN', false, err.message);
  }

  // 4. Double-dispatch attempt / Race condition test
  try {
    const v = await createTestVehicle(2000);
    const d = await createTestDriver('2030-01-01');
    const tripA = await createTestTrip(v.id, d.id, 500);
    const tripB = await createTestTrip(v.id, d.id, 500); // Uses same vehicle & driver

    console.log('Sending two concurrent dispatch requests to test race-condition logic...');
    const [resA, resB] = await Promise.all([
      fetch(`${BASE_URL}/trips/${tripA.id}/dispatch`, { method: 'POST', headers: getHeaders() }),
      fetch(`${BASE_URL}/trips/${tripB.id}/dispatch`, { method: 'POST', headers: getHeaders() })
    ]);

    const statusA = resA.status;
    const statusB = resB.status;
    const pass = (statusA === 200 && statusB === 400) || (statusA === 400 && statusB === 200);

    logTest(
      'Double-dispatch race condition locking',
      '/trips/:id/dispatch (concurrent)',
      'POST',
      'One 200, One 400',
      `A: ${statusA}, B: ${statusB}`,
      pass,
      pass ? 'Database transaction correctly blocked double-booking.' : 'Race condition was NOT prevented!'
    );
  } catch (err) {
    logTest('Double-dispatch race condition locking', '/trips/:id/dispatch (concurrent)', 'POST', 'One 200, One 400', 'ERR_CONN', false, err.message);
  }

  // 5. Cancel attempted on a Completed trip
  try {
    const v = await createTestVehicle(2000);
    const d = await createTestDriver('2030-01-01');
    const trip = await createTestTrip(v.id, d.id, 500);

    // Dispatch
    await fetch(`${BASE_URL}/trips/${trip.id}/dispatch`, { method: 'POST', headers: getHeaders() });
    // Complete
    await fetch(`${BASE_URL}/trips/${trip.id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ finalOdometer: 150, fuelUsed: 10, remarks: 'Finished' })
    });

    // Try to Cancel
    const res = await fetch(`${BASE_URL}/trips/${trip.id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest(
      'Cancel completed trip',
      `/trips/:id/cancel`,
      'POST',
      400,
      res.status,
      res.status === 400 && data.errorCode === 'VALIDATION_ERROR',
      data.message || 'No error message returned'
    );
  } catch (err) {
    logTest('Cancel completed trip', '/trips/:id/cancel', 'POST', 400, 'ERR_CONN', false, err.message);
  }

  // Write markdown table logs
  let md = '# Trip Business Rules Smoke Test Logs\n\n';
  md += `Run timestamp: ${new Date().toISOString()}\n\n`;
  md += '| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |\n';
  md += '| --- | --- | --- | --- | --- | --- | --- |\n';
  logs.forEach(l => {
    md += `| ${l.testName} | ${l.method} | ${l.endpoint} | ${l.expectedStatus} | ${l.actualStatus} | **${l.status}** | ${l.remarks} |\n`;
  });

  fs.writeFileSync(path.join(__dirname, 'smoke-trips.md'), md);
  console.log('=== TRIP SMOKE TESTS COMPLETE ===\n');
}

run();
