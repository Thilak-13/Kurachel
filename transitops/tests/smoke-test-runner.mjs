// TransitOps CRUD Smoke Test Runner
// Run this script to hit the running backend server and generate pass/fail logs.
// Usage: node tests/smoke-test-runner.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const adminCreds = { email: 'admin@transitops.com', password: 'adminpassword123' };
const driverCreds = { email: 'john.doe@transitops.com', password: 'driverpassword123' };

async function run() {
  console.log('=== STARTING CRITICAL ENDPOINT SMOKE TESTS ===');
  console.log(`Connecting to server at ${BASE_URL}...`);

  let adminToken = null;
  let driverToken = null;
  let useFallbackHeaders = false;

  // 1. Authenticate and obtain tokens
  try {
    const authRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loginIdentifier: adminCreds.email,
        password: adminCreds.password
      })
    });
    
    if (authRes.ok) {
      const data = await authRes.json();
      adminToken = data.data?.token || data.token;
      console.log('Successfully authenticated as ADMIN.');
      
      const driverRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginIdentifier: driverCreds.email,
          password: driverCreds.password
        })
      });
      if (driverRes.ok) {
        const dData = await driverRes.json();
        driverToken = dData.data?.token || dData.token;
        console.log('Successfully authenticated as DRIVER.');
      }
    } else {
      console.log('[WARNING] Auth endpoints returned error status. Falling back to X-User-Role mock headers for testing...');
      useFallbackHeaders = true;
    }
  } catch (err) {
    console.log('[WARNING] Could not connect to /auth/login. Server might be down or auth not implemented. Falling back to X-User-Role mock headers...');
    useFallbackHeaders = true;
  }

  // Define authorization headers helper
  const getHeaders = (role, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (useFallbackHeaders) {
      headers['X-User-Role'] = role; // Simulated fallback role
      headers['Authorization'] = `Bearer dummy-${role}-token`; // Dummy token matching role
    } else if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const vehicleLogs = [];
  const driverLogs = [];

  // Helper to log results
  const logTest = (category, testName, endpoint, method, expectedStatus, actualStatus, pass, remarks) => {
    const log = {
      testName,
      endpoint,
      method,
      expectedStatus,
      actualStatus,
      status: pass ? 'PASS' : 'FAIL',
      remarks
    };
    if (category === 'vehicle') {
      vehicleLogs.push(log);
    } else {
      driverLogs.push(log);
    }
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${method} ${endpoint} - ${testName} (Expected: ${expectedStatus}, Got: ${actualStatus})`);
  };

  // ==========================================
  // VEHICLE CRUD TESTS
  // ==========================================
  console.log('\n--- Running Vehicle Tests ---');
  let testVehicleId = null;
  const testRegNo = `TX-TEST-${Math.floor(Math.random() * 10000)}`;

  // Test 1: GET (list)
  try {
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'GET',
      headers: getHeaders('Admin', adminToken)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = null; }
    const isArray = Array.isArray(data);
    logTest('vehicle', 'GET Vehicle Roster List', '/vehicles', 'GET', 200, res.status, res.status === 200 && isArray, isArray ? `Count: ${data.length}` : 'Response not an array');
  } catch (err) {
    logTest('vehicle', 'GET Vehicle Roster List', '/vehicles', 'GET', 200, 'ERR_CONN', false, err.message);
  }

  // Test 2: GET filtered by status
  try {
    const res = await fetch(`${BASE_URL}/vehicles?status=Available`, {
      method: 'GET',
      headers: getHeaders('Admin', adminToken)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = null; }
    const isFiltered = Array.isArray(data) && data.every(v => v.status === 'Available');
    logTest('vehicle', 'GET Vehicles filtered by ?status=Available', '/vehicles?status=Available', 'GET', 200, res.status, res.status === 200 && isFiltered, isFiltered ? `Filtered count: ${data.length}` : 'Found non-Available vehicles or invalid shape');
  } catch (err) {
    logTest('vehicle', 'GET Vehicles filtered by ?status=Available', '/vehicles?status=Available', 'GET', 200, 'ERR_CONN', false, err.message);
  }

  // Test 3: POST Create Valid Vehicle (Admin)
  try {
    const body = {
      registrationNumber: testRegNo,
      model: 'Ford Transit',
      type: 'Van',
      maxLoadCapacity: 1500,
      odometer: 1000,
      acquisitionCost: 38000,
      status: 'Available'
    };
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders('Admin', adminToken),
      body: JSON.stringify(body)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    if (res.status === 201 && data.id) {
      testVehicleId = data.id;
    }
    logTest('vehicle', 'POST Create Valid Vehicle (Admin)', '/vehicles', 'POST', 201, res.status, res.status === 201 && data.registrationNumber === testRegNo, data.id ? `Created ID: ${data.id}` : 'Failed to return vehicle object');
  } catch (err) {
    logTest('vehicle', 'POST Create Valid Vehicle (Admin)', '/vehicles', 'POST', 201, 'ERR_CONN', false, err.message);
  }

  // Test 4: POST Create Duplicate reg number (409)
  try {
    const body = {
      registrationNumber: testRegNo, // Same reg number
      model: 'Chevrolet Express',
      type: 'Van',
      maxLoadCapacity: 1200,
      odometer: 500,
      acquisitionCost: 32000,
      status: 'Available'
    };
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders('Admin', adminToken),
      body: JSON.stringify(body)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest('vehicle', 'POST Duplicate registrationNumber (409)', '/vehicles', 'POST', 409, res.status, res.status === 409 && data.errorCode === 'DUPLICATE_REG_NUMBER', data.errorCode || 'No errorCode returned');
  } catch (err) {
    logTest('vehicle', 'POST Duplicate registrationNumber (409)', '/vehicles', 'POST', 409, 'ERR_CONN', false, err.message);
  }

  // Test 5: POST Create Invalid Status Enum (400)
  try {
    const body = {
      registrationNumber: `TX-BAD-${Math.floor(Math.random() * 10000)}`,
      model: 'Ram ProMaster',
      type: 'Van',
      maxLoadCapacity: 1200,
      odometer: 500,
      acquisitionCost: 34000,
      status: 'JUNK_STATUS' // Invalid status
    };
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders('Admin', adminToken),
      body: JSON.stringify(body)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest('vehicle', 'POST Invalid status enum (400)', '/vehicles', 'POST', 400, res.status, res.status === 400 && data.errorCode === 'VALIDATION_ERROR', data.errorCode || 'No errorCode returned');
  } catch (err) {
    logTest('vehicle', 'POST Invalid status enum (400)', '/vehicles', 'POST', 400, 'ERR_CONN', false, err.message);
  }

  // Test 6: POST Create Forbidden (Driver Role)
  try {
    const body = {
      registrationNumber: `TX-FORB-${Math.floor(Math.random() * 10000)}`,
      model: 'Ram ProMaster',
      type: 'Van',
      maxLoadCapacity: 1200,
      odometer: 500,
      acquisitionCost: 34000,
      status: 'Available'
    };
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: getHeaders('Driver', driverToken),
      body: JSON.stringify(body)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest('vehicle', 'POST Create Vehicle - Forbidden role (Driver)', '/vehicles', 'POST', 403, res.status, res.status === 403 && data.error === 'FORBIDDEN', data.error || 'No error key returned');
  } catch (err) {
    logTest('vehicle', 'POST Create Vehicle - Forbidden role (Driver)', '/vehicles', 'POST', 403, 'ERR_CONN', false, err.message);
  }

  // Test 7: PUT Update Vehicle (Admin/Dispatcher)
  if (testVehicleId) {
    try {
      const body = {
        model: 'Ford Transit Modified',
        status: 'On Trip'
      };
      const res = await fetch(`${BASE_URL}/vehicles/${testVehicleId}`, {
        method: 'PUT',
        headers: getHeaders('Admin', adminToken),
        body: JSON.stringify(body)
      });
      logTest('vehicle', 'PUT Update Vehicle details (Admin)', `/vehicles/${testVehicleId}`, 'PUT', 200, res.status, res.status === 200, 'Successfully updated details');
    } catch (err) {
      logTest('vehicle', 'PUT Update Vehicle details (Admin)', `/vehicles/${testVehicleId}`, 'PUT', 200, 'ERR_CONN', false, err.message);
    }
  } else {
    logTest('vehicle', 'PUT Update Vehicle details (Admin)', '/vehicles/:id', 'PUT', 200, 'SKIPPED', false, 'Skipped - Creation failed');
  }

  // Test 8: DELETE Vehicle (Admin Only)
  if (testVehicleId) {
    try {
      const res = await fetch(`${BASE_URL}/vehicles/${testVehicleId}`, {
        method: 'DELETE',
        headers: getHeaders('Admin', adminToken)
      });
      logTest('vehicle', 'DELETE Vehicle (Admin)', `/vehicles/${testVehicleId}`, 'DELETE', 204, res.status, res.status === 204, 'Successfully deleted vehicle');
    } catch (err) {
      logTest('vehicle', 'DELETE Vehicle (Admin)', `/vehicles/${testVehicleId}`, 'DELETE', 204, 'ERR_CONN', false, err.message);
    }
  } else {
    logTest('vehicle', 'DELETE Vehicle (Admin)', '/vehicles/:id', 'DELETE', 204, 'SKIPPED', false, 'Skipped - Creation failed');
  }


  // ==========================================
  // DRIVER CRUD TESTS
  // ==========================================
  console.log('\n--- Running Driver Tests ---');
  let testDriverId = null;
  const testLicenseNo = `DL-TEST-${Math.floor(Math.random() * 1000000)}`;

  // Test 1: GET (list)
  try {
    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'GET',
      headers: getHeaders('Admin', adminToken)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = null; }
    const isArray = Array.isArray(data);
    logTest('driver', 'GET Driver Directory List', '/drivers', 'GET', 200, res.status, res.status === 200 && isArray, isArray ? `Count: ${data.length}` : 'Response not an array');
  } catch (err) {
    logTest('driver', 'GET Driver Directory List', '/drivers', 'GET', 200, 'ERR_CONN', false, err.message);
  }

  // Test 2: GET filtered by status
  try {
    const res = await fetch(`${BASE_URL}/drivers?status=Available`, {
      method: 'GET',
      headers: getHeaders('Admin', adminToken)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = null; }
    const isFiltered = Array.isArray(data) && data.every(d => d.status === 'Available');
    logTest('driver', 'GET Drivers filtered by ?status=Available', '/drivers?status=Available', 'GET', 200, res.status, res.status === 200 && isFiltered, isFiltered ? `Filtered count: ${data.length}` : 'Found non-Available drivers or invalid shape');
  } catch (err) {
    logTest('driver', 'GET Drivers filtered by ?status=Available', '/drivers?status=Available', 'GET', 200, 'ERR_CONN', false, err.message);
  }

  // Test 3: POST Create Valid Driver (Admin)
  try {
    const body = {
      name: 'Smoke Test Driver',
      licenseNumber: testLicenseNo,
      category: 'Class A',
      licenseExpiryDate: '2030-01-01',
      contact: '+1-555-9999',
      safetyScore: 98,
      status: 'Available'
    };
    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders('Admin', adminToken),
      body: JSON.stringify(body)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    if (res.status === 201 && data.id) {
      testDriverId = data.id;
    }
    logTest('driver', 'POST Create Valid Driver (Admin)', '/drivers', 'POST', 201, res.status, res.status === 201 && data.licenseNumber === testLicenseNo, data.id ? `Created ID: ${data.id}` : 'Failed to return driver object');
  } catch (err) {
    logTest('driver', 'POST Create Valid Driver (Admin)', '/drivers', 'POST', 201, 'ERR_CONN', false, err.message);
  }

  // Test 4: POST Create Invalid Status Enum (400)
  try {
    const body = {
      name: 'Bad Status Driver',
      licenseNumber: `DL-BAD-${Math.floor(Math.random() * 1000000)}`,
      category: 'Class A',
      licenseExpiryDate: '2030-01-01',
      contact: '+1-555-9999',
      safetyScore: 98,
      status: 'SUSPENDED_JUNK' // Invalid status
    };
    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders('Admin', adminToken),
      body: JSON.stringify(body)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest('driver', 'POST Invalid status enum (400)', '/drivers', 'POST', 400, res.status, res.status === 400 && data.errorCode === 'VALIDATION_ERROR', data.errorCode || 'No errorCode returned');
  } catch (err) {
    logTest('driver', 'POST Invalid status enum (400)', '/drivers', 'POST', 400, 'ERR_CONN', false, err.message);
  }

  // Test 5: POST Create Forbidden (Driver Role)
  try {
    const body = {
      name: 'Forbidden Driver',
      licenseNumber: `DL-FORB-${Math.floor(Math.random() * 1000000)}`,
      category: 'Class A',
      licenseExpiryDate: '2030-01-01',
      contact: '+1-555-9999',
      safetyScore: 98,
      status: 'Available'
    };
    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders('Driver', driverToken),
      body: JSON.stringify(body)
    });
    let data;
    try { data = await res.json(); } catch(e) { data = {}; }
    logTest('driver', 'POST Create Driver - Forbidden role (Driver)', '/drivers', 'POST', 403, res.status, res.status === 403 && data.error === 'FORBIDDEN', data.error || 'No error key returned');
  } catch (err) {
    logTest('driver', 'POST Create Driver - Forbidden role (Driver)', '/drivers', 'POST', 403, 'ERR_CONN', false, err.message);
  }

  // Test 6: PUT Update Driver (Admin Only)
  if (testDriverId) {
    try {
      const body = {
        name: 'Smoke Test Driver Modified',
        status: 'On Trip'
      };
      const res = await fetch(`${BASE_URL}/drivers/${testDriverId}`, {
        method: 'PUT',
        headers: getHeaders('Admin', adminToken),
        body: JSON.stringify(body)
      });
      logTest('driver', 'PUT Update Driver details (Admin)', `/drivers/${testDriverId}`, 'PUT', 200, res.status, res.status === 200, 'Successfully updated details');
    } catch (err) {
      logTest('driver', 'PUT Update Driver details (Admin)', `/drivers/${testDriverId}`, 'PUT', 200, 'ERR_CONN', false, err.message);
    }
  } else {
    logTest('driver', 'PUT Update Driver details (Admin)', '/drivers/:id', 'PUT', 200, 'SKIPPED', false, 'Skipped - Creation failed');
  }

  // Test 7: DELETE Driver (Admin Only)
  if (testDriverId) {
    try {
      const res = await fetch(`${BASE_URL}/drivers/${testDriverId}`, {
        method: 'DELETE',
        headers: getHeaders('Admin', adminToken)
      });
      logTest('driver', 'DELETE Driver (Admin)', `/drivers/${testDriverId}`, 'DELETE', 204, res.status, res.status === 204, 'Successfully deleted driver');
    } catch (err) {
      logTest('driver', 'DELETE Driver (Admin)', `/drivers/${testDriverId}`, 'DELETE', 204, 'ERR_CONN', false, err.message);
    }
  } else {
    logTest('driver', 'DELETE Driver (Admin)', '/drivers/:id', 'DELETE', 204, 'SKIPPED', false, 'Skipped - Creation failed');
  }

  // ==========================================
  // WRITE RESULTS TO MARKDOWN
  // ==========================================
  const generateMarkdownTable = (logs) => {
    let md = '| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |\n';
    md += '| --- | --- | --- | --- | --- | --- | --- |\n';
    logs.forEach(l => {
      md += `| ${l.testName} | ${l.method} | ${l.endpoint} | ${l.expectedStatus} | ${l.actualStatus} | **${l.status}** | ${l.remarks} |\n`;
    });
    return md;
  };

  const vehicleMd = `# Vehicle CRUD Smoke Test Logs\n\nRun timestamp: ${new Date().toISOString()}\n\n${generateMarkdownTable(vehicleLogs)}`;
  const driverMd = `# Driver CRUD Smoke Test Logs\n\nRun timestamp: ${new Date().toISOString()}\n\n${generateMarkdownTable(driverLogs)}`;

  fs.writeFileSync(path.join(__dirname, 'smoke-vehicles.md'), vehicleMd);
  fs.writeFileSync(path.join(__dirname, 'smoke-drivers.md'), driverMd);

  console.log('\n=== SMOKE TESTS COMPLETE. LOGS WRITTEN ===');
}

run();
