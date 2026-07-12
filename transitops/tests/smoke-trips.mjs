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
    const regNo = `MH-12-TR-${1000 + Math.floor(Math.random() * 9000)}`;
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        registrationNumber: regNo,
        model: 'Toyota Dyna',
        type: 'Truck',
        maxLoadCapacity: maxCapacity,
        odometer: 100,
        acquisitionCost: 1500000.0,
        status
      })
    });
    return await res.json();
  };

  // Helper to update a test vehicle
  const updateTestVehicle = async (vehicleId, payload) => {
    const res = await fetch(`${BASE_URL}/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  };

  // Helper to create a test driver
  const createTestDriver = async (expiryDate, status = 'Available') => {
    const licenseNo = `DL14 ${30000000000 + Math.floor(Math.random() * 9000000000)}`;
    const phoneNo = `+91-${9000000000 + Math.floor(Math.random() * 1000000000)}`;
    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: 'Trip Tester',
        licenseNumber: licenseNo,
        category: 'Class A',
        licenseExpiryDate: expiryDate,
        contact: phoneNo,
        phone: phoneNo,
        safetyScore: 90,
        status
      })
    });
    return await res.json();
  };

  // Helper to update a test driver
  const updateTestDriver = async (driverId, payload) => {
    const res = await fetch(`${BASE_URL}/drivers/${driverId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
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
        source: 'Mumbai, MH',
        destination: 'Pune, MH',
        cargoWeight,
        plannedDistance: 150
      })
    });
    return await res.json();
  };

  // 1. Dispatch with overweight cargo (cargo capacity changes after draft creation)
  try {
    const v = await createTestVehicle(1000); // Capacity 1000kg
    const d = await createTestDriver('2030-01-01'); // Valid
    const trip = await createTestTrip(v.id, d.id, 800); // 800kg (fits fine initially)

    // Now, decrease vehicle capacity to 500kg (so it becomes overloaded!)
    await updateTestVehicle(v.id, { maxLoadCapacity: 500 });

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
    
    // We try to create a trip with a suspended driver, which should be rejected at creation
    const resCreate = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        vehicleId: v.id,
        driverId: d.id,
        source: 'Mumbai, MH',
        destination: 'Pune, MH',
        cargoWeight: 500
      })
    });
    
    logTest(
      'Create trip with Suspended driver',
      `/trips`,
      'POST',
      400,
      resCreate.status,
      resCreate.status === 400,
      'Trip creation correctly blocked for suspended driver.'
    );
  } catch (err) {
    logTest('Create trip with Suspended driver', '/trips', 'POST', 400, 'ERR_CONN', false, err.message);
  }

  // 3. Dispatch with expired license (expiring between draft and dispatch)
  try {
    const v = await createTestVehicle(2000);
    const d = await createTestDriver('2030-01-01'); // Valid initially
    const trip = await createTestTrip(v.id, d.id, 500); // Draft created successfully

    // Now, simulate the license expiring by updating the driver to an expired date
    await updateTestDriver(d.id, { licenseExpiryDate: '2020-01-01' });

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

  // 6. LICENSE EXPIRY AT DISPATCH — Time-of-check gap regression test
  // Scenario: Trip created with a VALID driver, then driver's license is expired
  // in the DB AFTER creation but BEFORE dispatch. Dispatch must be rejected.
  // This is the most important new test in the final regression pass.
  try {
    const v = await createTestVehicle(2000);
    const d = await createTestDriver('2030-01-01'); // Valid at creation time
    const trip = await createTestTrip(v.id, d.id, 500);

    // Simulate time passing: directly patch the driver's license expiry to a past date
    // using the admin PATCH endpoint to expire the license AFTER the trip was created
    await fetch(`${BASE_URL}/drivers/${d.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ licenseExpiryDate: '2020-01-01' })
    });

    // Now attempt dispatch — should be rejected because license is now expired
    const res = await fetch(`${BASE_URL}/trips/${trip.id}/dispatch`, {
      method: 'POST',
      headers: getHeaders()
    });
    let data = {};
    try { data = await res.json(); } catch(e) {}

    const pass = res.status === 400 && (
      (data.message && data.message.toLowerCase().includes('expired')) ||
      (data.message && data.message.toLowerCase().includes('license'))
    );

    logTest(
      'License expiry at dispatch (TOCTOU gap)',
      `/trips/:id/dispatch`,
      'POST',
      400,
      res.status,
      pass,
      pass
        ? 'Dispatch correctly rejected expired license after trip creation.'
        : `Expected 400 + "expired" message. Got: ${res.status} — ${data.message || 'no message'}`
    );
  } catch (err) {
    logTest('License expiry at dispatch (TOCTOU gap)', '/trips/:id/dispatch', 'POST', 400, 'ERR_CONN', false, err.message);
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
