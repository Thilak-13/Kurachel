# Kurachel — Fleet & Logistics Operations Portal

A full-stack fleet management system for tracking vehicles, drivers, trips, fuel, maintenance, and operational ROI analytics.

---

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React + Vite (SPA, port 5173)               |
| Backend   | Node.js + Express (port 5000)               |
| Database  | SQLite via Prisma ORM                       |
| Auth      | JWT (bcrypt passwords)                      |
| Shared    | CommonJS modules in `/shared` (validators, enums) |

---

## Directory Structure

```
transitops/
├── frontend/               React SPA (Vite)
├── backend/                Express HTTP API
│   ├── prisma/             Schema + Migrations + Seed
│   └── src/
│       ├── controllers/    HTTP handlers
│       ├── services/       Business logic + DB transactions
│       ├── middlewares/    JWT auth, RBAC guard, error handler
│       ├── validators/     express-validator input schemas
│       └── routes/         Route definitions
├── shared/
│   ├── enums.js            Canonical status + role constants
│   ├── api-contract.md     REST API specification (source of truth)
│   └── validators/
│       ├── rbac.js         RBAC permission matrix (imported by backend)
│       └── maintenance.rules.js  Maintenance state rules (imported by backend)
└── tests/                  Automated smoke test runners
```

---

## First-Time Setup

### 1. Install Dependencies

```bash
cd transitops/frontend && npm install
cd ../backend && npm install
```

### 2. Apply Migrations & Seed the Database

```bash
cd transitops/backend

# Apply all migrations (creates dev.db)
npx prisma migrate dev

# Or if resetting from scratch:
npx prisma migrate reset --force

# Regenerate Prisma client (required after any schema change)
npx prisma generate

# Seed the database
npm run db:seed
```

**Applied migrations (in order):**
1. `20260712063302_init_transitops_tables` — base schema
2. `20260712065940_add_username_to_user` — username field on User
3. `20260712072031_add_api_contract_fields` — unique constraints, contract alignment

### 3. Start the Servers

```bash
# Backend (in transitops/backend)
npm run dev          # runs on http://localhost:5000

# Frontend (in transitops/frontend)
npm run dev          # runs on http://localhost:5173
```

---

## Demo Credentials

All demo accounts use the `@kurachel.com` domain.

| Role                | Email                          | Password              |
|---------------------|--------------------------------|-----------------------|
| Admin               | admin@kurachel.com             | adminpassword123      |
| Fleet Manager       | fleet@kurachel.com             | fleetpassword123      |
| Dispatcher          | dispatcher@kurachel.com        | dispatchpassword123   |
| Maintenance Manager | maintenance@kurachel.com       | maintpassword123      |
| Driver              | john.doe@kurachel.com          | driverpassword123     |

> **Note:** John Doe is intentionally kept as a non-Indian name for smoke-test compatibility (used as the seeded driver user linked to a User account).

### Seed Data Summary

- **5 Indian Vehicles:** Tata Ultra T.7, Mahindra Bolero Pik-Up, Ashok Leyland Dost Strong, Eicher Pro 2095, Force Traveller
- **5 Indian Drivers:** 4 with Indian names (linked or unlinked) + John Doe (linked to Driver user account)
- **3 Trips:** 1 Completed, 1 En Route (IN_SERVICE), 1 Scheduled (SCHEDULED/Draft)
- **2 Maintenance Logs**, **2 Fuel Logs**, **2 Expense Records**

---

## RBAC Permission Matrix

| Action               | Admin | Fleet Manager | Dispatcher | Driver | Maintenance Manager |
|----------------------|:-----:|:-------------:|:----------:|:------:|:-------------------:|
| Create Vehicle       | ✅    | ✅            | ❌         | ❌     | ❌                  |
| View Vehicles        | ✅    | ✅            | ✅         | ✅     | ❌                  |
| Create Driver        | ✅    | ✅            | ❌         | ❌     | ❌                  |
| View Drivers         | ✅    | ✅            | ✅         | ❌     | ❌                  |
| Create/Dispatch Trip | ✅    | ❌            | ✅         | ❌     | ❌                  |
| View Trips           | ✅    | ❌            | ✅         | ✅     | ❌                  |
| Maintenance Create   | ✅    | ❌            | ✅         | ❌     | ✅                  |
| View Maintenance     | ✅    | ❌            | ✅         | ❌     | ✅                  |
| View Reports         | ✅    | ✅            | ❌         | ❌     | ✅                  |
| View Dashboard       | ✅    | ✅            | ✅         | ❌     | ✅                  |

> **RBAC source of truth:** `shared/validators/rbac.js` → imported by `backend/src/middlewares/rbac.middleware.js`

---

## Dispatch Validation Source of Truth

All dispatch business rules are enforced in **`backend/src/services/validation.service.js`**.

`shared/validators/dispatch.rules.js` was deleted (2026-07-12) — it was dead code, never imported, and had diverged from the live logic. See `shared/api-contract.md` for the full decision note.

---

## Known Tech Debt

1. **Duplicate Driver fields:** The `Driver` schema has both `firstName`/`lastName` AND a denormalized `name` field, and both `contact` AND `phone` fields. These exist because the initial scaffold and the seed script were written independently. A post-hackathon migration should consolidate to `name` + `contact` only.

The current schema persists `Trip.cargoWeight` and `MaintenanceLog.status`; these were added by migration `20260712083051_add_cargo_weight_and_maintenance_status`.

---

## Running Tests

```bash
cd transitops

# Trip business rules + TOCTOU regression
node tests/smoke-trips.mjs

# Maintenance state rules
node tests/smoke-maintenance.mjs

# End-to-end operational workflow (happy path)
node tests/smoke-workflow.mjs

# RBAC bug bash (all 5 roles × 8 actions = 40 checks)
node tests/rbac-bug-bash.mjs
```
