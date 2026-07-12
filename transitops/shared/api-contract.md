# TransitOps API Contract

This document outlines the API endpoints, methods, and payload structures for the TransitOps system.

## Authentication / Roles
To simplify local verification without full auth setup, API calls should include a `X-User-Role` header (e.g., `ADMIN`, `DISPATCHER`, `DRIVER`) which the backend uses to evaluate permission via RBAC rules.

---

## Vehicles (`/vehicles`)

### GET `/api/vehicles`
*   **Description:** Get list of all vehicles.
*   **Roles:** Admin, Dispatcher, Driver
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "v1",
        "licensePlate": "TX-1234",
        "make": "Ford",
        "model": "Transit",
        "type": "Van",
        "status": "ACTIVE",
        "odometer": 45000,
        "batteryLevel": 85
      }
    ]
    ```

### POST `/api/vehicles`
*   **Description:** Create a new vehicle.
*   **Roles:** Admin
*   **Request Body:**
    ```json
    {
      "licensePlate": "TX-5678",
      "make": "Chevrolet",
      "model": "Express",
      "type": "Van",
      "status": "ACTIVE",
      "odometer": 12000,
      "batteryLevel": 98
    }
    ```
*   **Response (201 Created):** Created vehicle object.

---

## Drivers (`/drivers`)

### GET `/api/drivers`
*   **Description:** Get list of drivers.
*   **Roles:** Admin, Dispatcher
*   **Response (200 OK):**
    ```json
    [
      {
        "id": "d1",
        "name": "Jane Doe",
        "licenseNumber": "DL-987654",
        "status": "ACTIVE",
        "email": "jane@transitops.example",
        "phone": "555-0199"
      }
    ]
    ```

---

## Trips (`/trips`)

### GET `/api/trips`
*   **Description:** List all scheduled, active, completed, or cancelled trips.
*   **Roles:** Admin, Dispatcher, Driver

### POST `/api/trips`
*   **Description:** Dispatch / schedule a new trip.
*   **Roles:** Admin, Dispatcher
*   **Request Body:**
    ```json
    {
      "vehicleId": "v1",
      "driverId": "d1",
      "routeName": "Route 42 - Downtown Express",
      "status": "SCHEDULED"
    }
    ```
*   **Response (201 Created / 400 Bad Request if validation rules fail)**

---

## Maintenance (`/maintenance`)

### GET `/api/maintenance`
*   **Description:** Get all scheduled or completed maintenance tasks.

---

## Reports (`/reports` & `/dashboard`)

### GET `/api/dashboard/stats`
*   **Description:** Fetch aggregated summary stats for dashboard widgets.
*   **Roles:** Admin, Dispatcher
