# Vehicle CRUD Smoke Test Logs

Run timestamp: 2026-07-12T07:12:36.524Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| GET Vehicle Roster List | GET | /vehicles | 200 | 200 | **FAIL** | Response not an array |
| GET Vehicles filtered by ?status=Available | GET | /vehicles?status=Available | 200 | 200 | **FAIL** | Found non-Available vehicles or invalid shape |
| POST Create Valid Vehicle (Admin) | POST | /vehicles | 201 | 200 | **FAIL** | Failed to return vehicle object |
| POST Duplicate registrationNumber (409) | POST | /vehicles | 409 | 200 | **FAIL** | No errorCode returned |
| POST Invalid status enum (400) | POST | /vehicles | 400 | 200 | **FAIL** | No errorCode returned |
| POST Create Vehicle - Forbidden role (Driver) | POST | /vehicles | 403 | 200 | **FAIL** | No error key returned |
| PUT Update Vehicle details (Admin) | PUT | /vehicles/:id | 200 | SKIPPED | **FAIL** | Skipped - Creation failed |
| DELETE Vehicle (Admin) | DELETE | /vehicles/:id | 204 | SKIPPED | **FAIL** | Skipped - Creation failed |
