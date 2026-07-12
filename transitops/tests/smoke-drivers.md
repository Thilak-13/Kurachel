# Driver CRUD Smoke Test Logs

Run timestamp: 2026-07-12T07:12:36.525Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| GET Driver Directory List | GET | /drivers | 200 | 200 | **FAIL** | Response not an array |
| GET Drivers filtered by ?status=Available | GET | /drivers?status=Available | 200 | 200 | **FAIL** | Found non-Available drivers or invalid shape |
| POST Create Valid Driver (Admin) | POST | /drivers | 201 | 200 | **FAIL** | Failed to return driver object |
| POST Invalid status enum (400) | POST | /drivers | 400 | 200 | **FAIL** | No errorCode returned |
| POST Create Driver - Forbidden role (Driver) | POST | /drivers | 403 | 200 | **FAIL** | No error key returned |
| PUT Update Driver details (Admin) | PUT | /drivers/:id | 200 | SKIPPED | **FAIL** | Skipped - Creation failed |
| DELETE Driver (Admin) | DELETE | /drivers/:id | 204 | SKIPPED | **FAIL** | Skipped - Creation failed |
