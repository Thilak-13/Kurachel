# Vehicle CRUD Smoke Test Logs

Run timestamp: 2026-07-12T07:26:30.324Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| GET Vehicle Roster List | GET | /vehicles | 200 | 200 | **PASS** | Count: 3 |
| GET Vehicles filtered by ?status=Available | GET | /vehicles?status=Available | 200 | 200 | **PASS** | Filtered count: 1 |
| POST Create Valid Vehicle (Admin) | POST | /vehicles | 201 | 201 | **PASS** | Created ID: 906e345d-cfa6-47db-b68e-2b43a1d187d9 |
| POST Duplicate registrationNumber (409) | POST | /vehicles | 409 | 409 | **PASS** | DUPLICATE_REG_NUMBER |
| POST Invalid status enum (400) | POST | /vehicles | 400 | 400 | **PASS** | VALIDATION_ERROR |
| POST Create Vehicle - Forbidden role (Driver) | POST | /vehicles | 403 | 403 | **PASS** | FORBIDDEN |
| PUT Update Vehicle details (Admin) | PUT | /vehicles/906e345d-cfa6-47db-b68e-2b43a1d187d9 | 200 | 200 | **PASS** | Successfully updated details |
| DELETE Vehicle (Admin) | DELETE | /vehicles/906e345d-cfa6-47db-b68e-2b43a1d187d9 | 204 | 204 | **PASS** | Successfully deleted vehicle |
