# Kurachel — Grader Demo Script
## Sync Checkpoint 4 Final Demo

**Estimated duration:** ~8 minutes  
**Key highlight:** License-expiry-at-dispatch rejection (deliberate TOCTOU race condition catch — not a scripted happy path)

---

## Pre-Demo Setup

```bash
# Ensure servers are running:
cd transitops/backend && npm run dev     # port 5000
cd transitops/frontend && npm run dev   # port 5173

# Optional: Reset + reseed for a clean demo
npx prisma migrate reset --force
npm run db:seed
```

Open `http://localhost:5173` in a browser.

---

## Step 1 — Log In as Admin

1. Open `http://localhost:5173`
2. Enter credentials:
   - **Email:** `admin@kurachel.com`
   - **Password:** `adminpassword123`
3. Click **Sign In**
4. ✅ You land on the **Dashboard** — observe live KPIs: Active Vehicles, Available Drivers, Active Trips, Fleet Utilization %

> **Point out to graders:** The Dashboard KPI cards pull from real DB aggregates via `GET /api/dashboard`. The Dispatcher and Fleet Manager roles also see this; Driver role is blocked (verified by RBAC bug bash).

---

## Step 2 — Register an Indian Vehicle

1. Navigate to **Vehicles** in the sidebar
2. Click **+ Add Vehicle**
3. Fill in:
   - **Registration:** `MH-14-KR-9001`
   - **Make:** Tata
   - **Model:** Prima 4028.S
   - **Type:** Heavy Commercial Vehicle
   - **Max Load:** `28000` kg
   - **Odometer:** `0`
   - **Cost:** `4500000`
4. Click **Save**
5. ✅ Vehicle appears in the list with status **Available**

---

## Step 3 — Register a Driver

1. Navigate to **Drivers** in the sidebar
2. Click **+ Add Driver**
3. Fill in:
   - **Name:** Arjun Mehta
   - **License No:** `MH-DL-2024-888`
   - **Category:** Class A (Heavy)
   - **License Expiry:** `2030-12-31`
   - **Contact:** `9876543210`
   - **Safety Score:** `92`
4. Click **Save**
5. ✅ Driver appears with status **Available**

---

## Step 4 — Demonstrate the License Expiry Rejection (THE KEY DEMO MOMENT)

> **Context for graders:** This test exposes a subtle time-of-check vs time-of-use (TOCTOU) gap. A dispatcher creates a trip with a valid driver, but the driver's license expires (or is suspended by HR) **after** the trip is created. Without the fix, dispatch would proceed with an expired license. **This was caught and fixed in this review pass.**

### 4a — Create a trip with the new driver
1. Navigate to **Trips** → **+ New Trip**
2. Select the vehicle `MH-14-KR-9001` and driver `Arjun Mehta`
3. Set:
   - **Route:** Mumbai → Pune
   - **Cargo Weight:** `15000` kg
4. Click **Create** → ✅ Trip created in **Draft** status

### 4b — Simulate license expiry AFTER trip creation
Using the API directly (or via Drivers page **Edit**):
- Update Arjun Mehta's license expiry to `2020-01-01` (a past date)

_Via REST:_
```bash
curl -X PUT http://localhost:5000/api/drivers/{driverId} \
  -H "Authorization: Bearer {adminToken}" \
  -H "Content-Type: application/json" \
  -d '{"licenseExpiryDate": "2020-01-01"}'
```

### 4c — Attempt Dispatch → Show rejection
1. Back on the Trips page, click **Dispatch** on the draft trip
2. ❌ Server returns `400 Bad Request`:
   ```json
   {
     "message": "Driver license is expired (Expiry date: 2020-01-01). Cannot dispatch.",
     "success": false
   }
   ```
3. **Point out:** This check happens **inside the Prisma `$transaction`** — it re-reads the driver's live `licenseExpiryDate` at the moment of dispatch, not at trip creation time.

### 4d — Fix the driver, dispatch successfully
1. Update Arjun Mehta's license expiry back to `2030-12-31`
2. Click **Dispatch** again
3. ✅ Trip status → **Dispatched**; Vehicle status → **On Trip**; Driver status → **On Trip**

---

## Step 5 — Complete the Trip

1. Click **Complete** on the dispatched trip
2. Enter:
   - **Final Odometer:** `350`
   - **Fuel Consumed:** `42`
3. Click **Submit**
4. ✅ Trip → **Completed**; Vehicle → **Available**; Driver → **Available**

---

## Step 6 — Open Maintenance

1. Navigate to **Maintenance** → **+ Open Ticket**
2. Select vehicle `MH-14-KR-9001`
3. Enter:
   - **Type:** Routine
   - **Description:** Post-trip brake inspection
4. Click **Open**
5. ✅ Vehicle status immediately → **In Shop** (grounding override — even mid-trip vehicles are grounded)

---

## Step 7 — Close Maintenance & Verify Dashboard

1. Click **Close** on the maintenance ticket
2. Enter **Cost:** `2500`
3. Click **Close Ticket**
4. ✅ Vehicle status → **Available** (Retired vehicles stay Retired — verified in smoke tests)

5. Navigate to **Dashboard**
6. ✅ KPIs updated in real time — vehicle is now counted as Available again

7. Navigate to **Reports** → ✅ The vehicle's operational cost, fuel efficiency (km/L), and ROI % appear in the analytics table.

---

## Step 8 — RBAC Demo (Bonus — 2 minutes)

1. Log out → Log in as **Dispatcher** (`dispatcher@kurachel.com` / `dispatchpassword123`)
2. ✅ Can see: Vehicles, Drivers, Trips, Maintenance, Dashboard
3. ❌ Cannot see: Reports (403), cannot create Vehicles or Drivers

4. Log out → Log in as **Maintenance Manager** (`maintenance@kurachel.com` / `maintpassword123`)
5. ✅ Can see: Maintenance, Reports, Dashboard
6. ❌ Cannot see: Vehicles page, Drivers page, Trips (all 403)

> **This was verified by automated `tests/rbac-bug-bash.mjs` — 40/40 PASS across all 5 roles × 8 actions.**

---

## Summary of Key Fixes Demonstrated

| # | Fix | Demonstrated By |
|---|-----|-----------------|
| 1 | `dispatch.rules.js` deleted (dead code) | `shared/validators/` — file no longer exists |
| 2 | License-expiry TOCTOU gap patched | Step 4 rejection demo |
| 3 | Full regression re-run clean | `smoke-trips.mjs` 6/6 PASS |
| 4 | RBAC bug bash all 5 roles | Step 8 + `rbac-bug-bash.md` (40/40 PASS) |
| 5 | README accurate to final state | `README.md` — full rewrite |
| 6 | This demo script | `tests/DEMO_SCRIPT.md` |
