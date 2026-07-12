# TransitOps API Contract

This API contract is the single source of truth for the communication between the frontend and the backend.

## Error Response Format
All error responses will have the following JSON structure:
```json
{
  "errorCode": "DUPLICATE_REG_NUMBER | VALIDATION_ERROR | FORBIDDEN",
  "message": "Human readable error description",
  "details": {}
}
```

---

## 1. Authentication & Session (`/auth`)

### POST `/api/auth/login`
*   **Method:** `POST`
*   **Description:** Log in a user and establish a session.
*   **Request Body:**
    ```json
    {
      "username": "dispatcher_bob",
      "password": "Password123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "u1",
        "username": "dispatcher_bob",
        "role": "Dispatcher"
      }
    }
    ```
*   **Errors:**
    *   `400 Bad Request` / `VALIDATION_ERROR` (Invalid credentials shape)
    *   `401 Unauthorized` (Invalid credentials)

---

## 2. Vehicles (`/vehicles`)

### Vehicle Object Schema
```json
{
  "id": "v-uuid-1",
  "registrationNumber": "TX-1234-A", // UNIQUE
  "model": "Ford Transit",
  "type": "Van",
  "maxLoadCapacity": 1200, // in kg
  "odometer": 45000.5, // in km
  "acquisitionCost": 35000.00,
  "status": "Available | On Trip | In Shop | Retired"
}
```

### GET `/api/vehicles`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `status` (optional) - e.g. `?status=Available` (server-side filter for Trip creation dropdown)
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "v-uuid-1",
        "registrationNumber": "TX-1234-A",
        "model": "Ford Transit",
        "type": "Van",
        "maxLoadCapacity": 1200,
        "odometer": 45000.5,
        "acquisitionCost": 35000.00,
        "status": "Available"
      }
    ]
    ```

### POST `/api/vehicles`
*   **Method:** `POST`
*   **Description:** Create a new vehicle. Only accessible by **Admin**.
*   **Request Body:**
    ```json
    {
      "registrationNumber": "TX-1234-A",
      "model": "Ford Transit",
      "type": "Van",
      "maxLoadCapacity": 1200,
      "odometer": 45000.5,
      "acquisitionCost": 35000.00,
      "status": "Available"
    }
    ```
*   **Response (201 Created):** Created vehicle object.
*   **Errors:**
    *   `409 Conflict` / `DUPLICATE_REG_NUMBER` (Registration number already exists)
    *   `400 Bad Request` / `VALIDATION_ERROR` (Invalid parameters or unknown status enum)
    *   `403 Forbidden` / `FORBIDDEN` (Insufficient permissions)

---

## 3. Drivers (`/drivers`)

### Driver Object Schema
```json
{
  "id": "d-uuid-1",
  "name": "Jane Doe",
  "licenseNumber": "DL-987654321",
  "category": "Class A",
  "licenseExpiryDate": "2028-12-31",
  "contact": "+1-555-0199",
  "safetyScore": 95,
  "status": "Available | On Trip | Suspended | Off Duty"
}
```

### GET `/api/drivers`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `status` (optional) - e.g. `?status=Available` (server-side filter for Trip creation dropdown)
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "d-uuid-1",
        "name": "Jane Doe",
        "licenseNumber": "DL-987654321",
        "category": "Class A",
        "licenseExpiryDate": "2028-12-31",
        "contact": "+1-555-0199",
        "safetyScore": 95,
        "status": "Available"
      }
    ]
    ```

### POST `/api/drivers`
*   **Method:** `POST`
*   **Description:** Create a new driver. Only accessible by **Admin**.
*   **Request Body:**
    ```json
    {
      "name": "Jane Doe",
      "licenseNumber": "DL-987654321",
      "category": "Class A",
      "licenseExpiryDate": "2028-12-31",
      "contact": "+1-555-0199",
      "safetyScore": 95,
      "status": "Available"
    }
    ```
*   **Response (201 Created):** Created driver object.
*   **Errors:**
    *   `400 Bad Request` / `VALIDATION_ERROR`
    *   `403 Forbidden` / `FORBIDDEN`

---

## 4. Trips (`/trips`)

### Trip Object Schema
```json
{
  "id": "t-uuid-1",
  "vehicleId": "v-uuid-1",
  "driverId": "d-uuid-1",
  "routeName": "Route 42 - Downtown Express",
  "cargoWeight": 500, // in kg
  "status": "Draft | Dispatched | Completed | Cancelled",
  "createdAt": "2026-07-12T10:00:00Z",
  "dispatchedAt": "2026-07-12T10:15:00Z",
  "completedAt": null
}
```

### POST `/api/trips`
*   **Method:** `POST`
*   **Description:** Create a trip (initial status is always `Draft`). Accessible by **Admin** or **Dispatcher**.
*   **Request Body:**
    ```json
    {
      "vehicleId": "v-uuid-1",
      "driverId": "d-uuid-1",
      "routeName": "Route 42 - Downtown Express",
      "cargoWeight": 500
    }
    ```
*   **Response (201 Created):** Created trip object with status `Draft`.

### POST `/api/trips/:id/dispatch`
*   **Method:** `POST`
*   **Description:** Dispatch a trip. Vehicle and Driver status will change to `On Trip`. Validates vehicle availability, driver availability, cargo weight capacity, and driver license validity.
*   **Response (200 OK):** Updated trip object with status `Dispatched`.
*   **Errors:**
    *   `400 Bad Request` / `VALIDATION_ERROR` (Validation rules failed, e.g. Driver is Suspended)

### POST `/api/trips/:id/complete`
*   **Method:** `POST`
*   **Description:** Complete a trip. Vehicle and Driver status will reset to `Available`.
*   **Response (200 OK):** Updated trip object with status `Completed`.

### POST `/api/trips/:id/cancel`
*   **Method:** `POST`
*   **Description:** Cancel a trip. Vehicle and Driver status will reset to `Available`.
*   **Response (200 OK):** Updated trip object with status `Cancelled`.

---

## 5. Maintenance (`/maintenance`)

### Maintenance Object Schema
```json
{
  "id": "m-uuid-1",
  "vehicleId": "v-uuid-1",
  "type": "Routine | Repair | Inspection",
  "description": "Oil filter replacement",
  "cost": 150.00,
  "status": "In Shop | Completed", // Open maintenance sets vehicle to "In Shop"
  "dateOpened": "2026-07-12T10:00:00Z",
  "dateClosed": null
}
```

### POST `/api/maintenance`
*   **Method:** `POST`
*   **Description:** Open maintenance. Vehicle status becomes `In Shop`.
*   **Request Body:**
    ```json
    {
      "vehicleId": "v-uuid-1",
      "type": "Routine",
      "description": "Oil filter replacement"
    }
    ```
*   **Response (201 Created):** Created maintenance log object.

### POST `/api/maintenance/:id/close`
*   **Method:** `POST`
*   **Description:** Close maintenance. Vehicle status resets to `Available` (unless vehicle is `Retired`).
*   **Request Body:**
    ```json
    {
      "cost": 150.00
    }
    ```
*   **Response (200 OK):** Closed maintenance log object.

---

## 6. Fuel Logs (`/fuel-logs`)

### POST `/api/fuel-logs`
*   **Method:** `POST`
*   **Description:** Log fuel purchase.
*   **Request Body:**
    ```json
    {
      "vehicleId": "v-uuid-1",
      "liters": 55.4,
      "cost": 88.50,
      "odometerReading": 45150.2
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "id": "f-uuid-1",
      "vehicleId": "v-uuid-1",
      "liters": 55.4,
      "cost": 88.50,
      "odometerReading": 45150.2,
      "timestamp": "2026-07-12T10:20:00Z"
    }
    ```

---

## 7. Expenses (`/expenses`)

### POST `/api/expenses`
*   **Method:** `POST`
*   **Description:** Record general trip/operational expenses.
*   **Request Body:**
    ```json
    {
      "tripId": "t-uuid-1",
      "category": "Tolls | Parking | Permits",
      "cost": 45.00,
      "description": "Bridge toll"
    }
    ```
*   **Response (201 Created):** Expense record object.

---

## 8. Dashboard (`/dashboard`)

### GET `/api/dashboard/kpis`
*   **Method:** `GET`
*   **Description:** Retrieve high-level KPIs for dispatcher/admin summary.
*   **Response (200 OK):**
    ```json
    {
      "activeVehicles": 12,          // Status: "On Trip"
      "availableVehicles": 5,        // Status: "Available"
      "vehiclesInMaintenance": 2,    // Status: "In Shop"
      "activeTrips": 12,             // Status: "Dispatched"
      "pendingTrips": 3,             // Status: "Draft"
      "driversOnDuty": 14,           // Status: "Available" or "On Trip"
      "fleetUtilizationPercent": 70.5 // Formula: (activeVehicles / (activeVehicles + availableVehicles)) * 100
    }
    ```

---

## 9. Reports (`/reports`)

### GET `/api/reports/operational`
*   **Method:** `GET`
*   **Description:** Retrieve operational ROI, fuel efficiency, and cost summaries per-vehicle.
*   **Response (200 OK):**
    ```json
    [
      {
        "vehicleId": "v-uuid-1",
        "registrationNumber": "TX-1234-A",
        "totalKm": 1200.5,
        "totalFuelLiters": 100.0,
        "fuelEfficiencyKmPerL": 12.00,      // Formula: totalKm / totalFuelLiters
        "maintenanceCost": 300.00,
        "fuelCost": 160.00,
        "expenseCost": 50.00,
        "totalOperationalCost": 510.00,     // Formula: maintenanceCost + fuelCost + expenseCost
        "tripRevenue": 2500.00,
        "acquisitionCost": 35000.00,
        "roi": 5.68                        // Formula: ((tripRevenue - totalOperationalCost) / acquisitionCost) * 100
      }
    ]
    ```
