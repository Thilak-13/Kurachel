// RBAC Bug Bash — tests all 5 roles against key protected actions
// Usage: node tests/rbac-bug-bash.mjs

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const ACCOUNTS = [
  { label: 'Admin',               email: 'admin@kurachel.com',       password: 'adminpassword123' },
  { label: 'Fleet Manager',       email: 'fleet@kurachel.com',        password: 'fleetpassword123' },
  { label: 'Dispatcher',          email: 'dispatcher@kurachel.com',   password: 'dispatchpassword123' },
  { label: 'Maintenance Manager', email: 'maintenance@kurachel.com',  password: 'maintpassword123' },
  { label: 'Driver',              email: 'john.doe@kurachel.com',     password: 'driverpassword123' },
];

// Actions to verify — [method, path, body, description, expectedForRole (fn)]
const PROBES = [
  { method: 'POST', path: '/vehicles', body: { registrationNumber: `RB-${Date.now()}`, model: 'Test', type: 'Van', maxLoadCapacity: 1000, odometer: 0, acquisitionCost: 10000, status: 'Available' }, label: 'Create Vehicle', allowed: ['Admin', 'Fleet Manager'] },
  { method: 'GET',  path: '/vehicles', body: null, label: 'View Vehicles', allowed: ['Admin', 'Fleet Manager', 'Dispatcher', 'Driver'] },
  { method: 'GET',  path: '/drivers',  body: null, label: 'View Drivers',  allowed: ['Admin', 'Fleet Manager', 'Dispatcher'] },
  { method: 'POST', path: '/drivers',  body: { name: 'RBAC Tester', licenseNumber: `DL-RB-${Date.now()}`, licenseExpiryDate: '2030-01-01', contact: '9999999999' }, label: 'Create Driver',  allowed: ['Admin', 'Fleet Manager'] },
  { method: 'GET',  path: '/trips',    body: null, label: 'View Trips',   allowed: ['Admin', 'Dispatcher', 'Driver'] },
  { method: 'GET',  path: '/maintenance', body: null, label: 'View Maintenance', allowed: ['Admin', 'Dispatcher', 'Maintenance Manager'] },
  { method: 'GET',  path: '/reports/operational', body: null, label: 'View Reports', allowed: ['Admin', 'Fleet Manager', 'Maintenance Manager'] },
  { method: 'GET',  path: '/dashboard', body: null, label: 'View Dashboard KPIs', allowed: ['Admin', 'Fleet Manager', 'Dispatcher', 'Maintenance Manager'] },
];

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginIdentifier: email, password })
  });
  if (!res.ok) throw new Error(`Login failed for ${email}: ${res.status}`);
  const data = await res.json();
  return data.data?.token || data.token;
}

async function probe(token, method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.status;
}

const results = [];
let allPass = true;

console.log('\n=== RBAC BUG BASH — All 5 Roles ===\n');

for (const account of ACCOUNTS) {
  let token;
  try {
    token = await login(account.email, account.password);
  } catch (e) {
    console.log(`[SKIP] Could not authenticate ${account.label}: ${e.message}`);
    continue;
  }

  for (const p of PROBES) {
    const status = await probe(token, p.method, p.path, p.body);
    const shouldBeAllowed = p.allowed.includes(account.label);
    const wasAllowed = status !== 403 && status !== 401;
    const pass = shouldBeAllowed ? wasAllowed : !wasAllowed;
    if (!pass) allPass = false;
    const symbol = pass ? '[PASS]' : '[FAIL]';
    const expectStr = shouldBeAllowed ? 'ALLOW' : 'DENY ';
    const gotStr    = wasAllowed      ? 'ALLOW' : `DENY(${status})`;
    console.log(`${symbol} ${account.label.padEnd(20)} | ${p.label.padEnd(22)} | Expected: ${expectStr} | Got: ${gotStr}`);
    results.push({ role: account.label, action: p.label, expected: shouldBeAllowed ? 'ALLOW' : 'DENY', actual: gotStr, pass });
  }
  console.log('');
}

console.log(allPass ? '\n✅ RBAC BUG BASH — ALL PASS' : '\n❌ RBAC BUG BASH — FAILURES FOUND');

// Write markdown report
let md = '# RBAC Bug Bash Report\n\n';
md += `Run: ${new Date().toISOString()}\n\n`;
md += '| Role | Action | Expected | Actual | Result |\n';
md += '|---|---|---|---|---|\n';
results.forEach(r => {
  md += `| ${r.role} | ${r.action} | ${r.expected} | ${r.actual} | **${r.pass ? 'PASS' : 'FAIL'}** |\n`;
});

import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
fs.writeFileSync(path.join(__dirname, 'rbac-bug-bash.md'), md);
console.log('\nReport written to tests/rbac-bug-bash.md');
