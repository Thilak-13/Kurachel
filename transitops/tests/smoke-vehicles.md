# Vehicle CRUD Smoke Test Logs

Run timestamp: 2026-07-12T11:29:33.914Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| GET Vehicle Roster List | GET | /vehicles | 200 | 200 | **PASS** | Count: 10 |
| GET Vehicles filtered by ?status=Available | GET | /vehicles?status=Available | 200 | 200 | **PASS** | Filtered count: 9 |
| POST Create Valid Vehicle (Admin) | POST | /vehicles | 201 | 201 | **PASS** | Created ID: 17d568ae-1579-4ade-969d-adca179f4b2b |
| POST Duplicate registrationNumber (409) | POST | /vehicles | 409 | 409 | **PASS** | DUPLICATE_REG_NUMBER |
| POST Invalid status enum (400) | POST | /vehicles | 400 | 400 | **PASS** | VALIDATION_ERROR |
| POST Create Vehicle - Forbidden role (Driver) | POST | /vehicles | 403 | 403 | **PASS** | FORBIDDEN |
| PUT Update Vehicle details (Admin) | PUT | /vehicles/17d568ae-1579-4ade-969d-adca179f4b2b | 200 | 200 | **PASS** | Successfully updated details |
| DELETE Vehicle (Admin) | DELETE | /vehicles/17d568ae-1579-4ade-969d-adca179f4b2b | 204 | 204 | **PASS** | Successfully deleted vehicle |
