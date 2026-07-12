# Kurachel Demo Script

This script guides graders and developers through demonstrating the core functionality and verified security fixes of the **Kurachel (formerly TransitOps)** fleet management backend.

---

## Preparation

Ensure your environment is set up:
1. Re-initialize database & seed:
   ```bash
   npx prisma migrate reset --force
   ```
2. Start the API backend:
   ```bash
   npm run dev
   ```
3. Start the Frontend development server:
   ```bash
   npm run dev
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
2. Click **Add Vehicle**
3. Enter details:
   - **Registration Number:** `MH-12-PQ-4567` (or similar conforming format)
   - **Model:** `Tata Ultra T.7`
   - **Max Load Capacity (kg):** `4500`
   - **Odometer (km):** `12000`
   - **Acquisition Cost (INR):** `1200000`
4. Click **Save Vehicle**
5. ✅ Vehicle appears on the list.

> **Validation Demo:** Try adding a vehicle with status "Junk" or invalid format like `MH-12-PQ-45678` — note that backend validators block it with `DUPLICATE_REG_NUMBER` or `VALIDATION_ERROR` (Status 409/400).

---

## Step 3 — Register a Driver (Indian license)

1. Navigate to **Drivers** in the sidebar
2. Click **Add Driver**
3. Enter details:
   - **Name:** `Vikramaditya Rao`
   - **License Number:** `DL14 20180098765` (conforms to `^[A-Z]{2}\d{2}\s?\d{11}$`)
   - **License Expiry:** `2032-08-15` (Valid future date)
   - **Contact Phone:** `+91-9876543210`
   - **Safety Score:** `92`
4. Click **Save Driver**
5. ✅ Driver appears on the list.

---

## Step 4 — Create a Draft Trip & Demonstrate Expiry Rejection (Safety Fix 1)

This shows the time-of-check safety validation protecting dispatch against later-expired licenses.

1. Navigate to **Trips** in the sidebar
2. Click **Create Trip** (Draft status)
3. Select the vehicle and driver registered in Steps 2 & 3
4. Enter locations:
   - **From:** `Mumbai, MH`
   - **To:** `Pune, MH`
   - **Cargo Weight (kg):** `3000` (Fails if > vehicle capacity!)
5. Click **Save Draft** → ✅ Trip is saved successfully as Draft.
6. Now, navigate to **Drivers** and click Edit on Vikramaditya Rao.
7. Change their **License Expiry** to a past date (e.g., `2020-01-01`) and save.
8. Go back to **Trips** and click **Dispatch** on the draft trip.
9. ❌ **Expected Result:** Dispatch fails with a clear warning: "Driver license is expired" (Status 400, `VALIDATION_ERROR`).
10. Edit the driver's license expiry back to a future date (`2032-08-15`), return to Trips, and click **Dispatch** again → ✅ Dispatch succeeds! Trip status updates to **Dispatched**.

---

## Step 5 — Complete the Trip & Log Fuel

1. Under **Trips**, click **Complete** on the dispatched trip.
2. Enter completion details:
   - **Final Odometer:** `12150` (+150 km)
   - **Fuel Consumed (Liters):** `15`
   - **Remarks:** `Smooth delivery via Expressway`
3. Click **Submit**
4. ✅ Trip transitions to **Completed**.
5. ✅ Vehicle odometer increases automatically.
6. ✅ A new fuel log is automatically logged on the vehicle with the reported volume.

---

## Step 6 — Open Maintenance (Grounded Override)

1. Navigate to **Maintenance** in the sidebar
2. Click **Log Service**
3. Select the vehicle and enter:
   - **Type:** `Brake Inspection`
   - **Description:** `Post-trip brake inspection`
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
