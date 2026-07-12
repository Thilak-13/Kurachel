// Automated Maintenance Safety Guard Smoke Tests
// Usage: node tests/smoke-maintenance.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const adminCreds = { email: 'admin@transitops.com', password: 'adminpassword123' };

async function run() {
  console.log('=== STARTING MAINTENANCE SECURITY AND STATE TESTS ===');

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

  const logs = [];
  const logTest = (testName, endpoint, method, expected, actual, pass, remarks) => {
    logs.push({ testName, endpoint, method, expected, actual, status: pass ? 'PASS' : 'FAIL', remarks });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${method} ${endpoint} - ${testName} (Expected: ${expected}, Got: ${actual})`);
  };

  // Helper to create a test vehicle
  const createTestVehicle = async (status = 'Available') => {
    const regNo = `TX-MAIN-${Math.floor(Math.random() * 100000)}`;
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        registrationNumber: regNo,
        model: 'Ford Transit',
        type: 'Van',
        maxLoadCapacity: 1200,
        odometer: 1000,
        acquisitionCost: 35000,
        status
      })
    });
    return await res.json();
  };

  // Helper to get vehicle details
  const getVehicleDetails = async (id) => {
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'GET',
      headers: getHeaders()
    });
    const list = await res.json();
    return list.find(v => v.id === id);
  };

  // Helper to create a test driver
  const createTestDriver = async () => {
    const licenseNo = `DL-MAIN-${Math.floor(Math.random() * 1000000)}`;
    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: 'Maintenance Tester',
        licenseNumber: licenseNo,
        category: 'Class A',
        licenseExpiryDate: '2030-01-01',
        contact: '9999999999',
        safetyScore: 95,
        status: 'Available'
      })
    });
    return await res.json();
  };

  // Helper to create a trip
  const createAndDispatchTrip = async (vehicleId, driverId) => {
    const tripRes = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        vehicleId,
        driverId,
        startLocation: 'Mumbai',
        endLocation: 'Pune',
        cargoWeight: 200
      })
    });
    const trip = await tripRes.json();
    await fetch(`${BASE_URL}/trips/${trip.id}/dispatch`, { method: 'POST', headers: getHeaders() });
    return trip;
  };

  // 1. Maintenance close on a Retired vehicle → stays Retired, not Available
  try {
    const v = await createTestVehicle('Available');

    // Create Maintenance ticket (vehicle status goes to 'In Shop')
    const ticketRes = await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ vehicleId: v.id, type: 'Routine', description: 'Retired test prep' })
    });
    const ticket = await ticketRes.json();

    // Force vehicle to 'Retired' via PUT update (Admin)
    await fetch(`${BASE_URL}/vehicles/${v.id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status: 'Retired' })
    });

    // Close maintenance ticket
    await fetch(`${BASE_URL}/maintenance/${ticket.id}/close`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cost: 250.0 })
    });

    // Recheck vehicle status
    const updatedVehicle = await getVehicleDetails(v.id);
    const staysRetired = updatedVehicle.status === 'Retired';

    logTest(
      'Maintenance close on Retired vehicle',
      '/maintenance/:id/close',
      'POST',
      'Retired',
      updatedVehicle.status,
      staysRetired,
      staysRetired ? 'Retired status dominates and remains unchanged.' : 'Vehicle was incorrectly bumped back to Available!'
    );
  } catch (err) {
    logTest('Maintenance close on Retired vehicle', '/maintenance/:id/close', 'POST', 'Retired', 'ERR_CONN', false, err.message);
  }

  // 2. Maintenance opened on a vehicle that is currently 'On Trip' → forced to 'In Shop' anyway
  try {
    const v = await createTestVehicle('Available');
    const d = await createTestDriver();
    await createAndDispatchTrip(v.id, d.id);

    // Verify vehicle is currently 'On Trip'
    let checkV = await getVehicleDetails(v.id);
    console.log(`Current vehicle status before maintenance: ${checkV.status}`);

    // Create Maintenance log
    await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ vehicleId: v.id, type: 'Routine', description: 'Emergency grounded' })
    });

    // Verify vehicle status is forced to 'In Shop' (overriding On Trip status)
    checkV = await getVehicleDetails(v.id);
    const overridesOnTrip = checkV.status === 'In Shop';

    logTest(
      'Maintenance override on active trip vehicle',
      '/maintenance',
      'POST',
      'In Shop',
      checkV.status,
      overridesOnTrip,
      overridesOnTrip ? 'Emergency grounding successfully forced vehicle to In Shop status.' : 'Failed to override active trip status!'
    );
  } catch (err) {
    logTest('Maintenance override on active trip vehicle', '/maintenance', 'POST', 'In Shop', 'ERR_CONN', false, err.message);
  }

  // Write markdown table logs
  let md = '# Maintenance Business Rules Smoke Test Logs\n\n';
  md += `Run timestamp: ${new Date().toISOString()}\n\n`;
  md += '| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |\n';
  md += '| --- | --- | --- | --- | --- | --- | --- |\n';
  logs.forEach(l => {
    md += `| ${l.testName} | ${l.method} | ${l.endpoint} | ${l.expected} | ${l.actual} | **${l.status}** | ${l.remarks} |\n`;
  });

  fs.writeFileSync(path.join(__dirname, 'smoke-maintenance.md'), md);
  console.log('=== MAINTENANCE SMOKE TESTS COMPLETE ===\n');
}

run();
