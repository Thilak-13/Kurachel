# Driver CRUD Smoke Test Logs

Run timestamp: 2026-07-12T07:26:30.325Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| GET Driver Directory List | GET | /drivers | 200 | 200 | **PASS** | Count: 2 |
| GET Drivers filtered by ?status=Available | GET | /drivers?status=Available | 200 | 200 | **PASS** | Filtered count: 1 |
| POST Create Valid Driver (Admin) | POST | /drivers | 201 | 201 | **PASS** | Created ID: 4110cbf4-d46e-4526-9bff-9074da38e56e |
| POST Invalid status enum (400) | POST | /drivers | 400 | 400 | **PASS** | VALIDATION_ERROR |
| POST Create Driver - Forbidden role (Driver) | POST | /drivers | 403 | 403 | **PASS** | FORBIDDEN |
| PUT Update Driver details (Admin) | PUT | /drivers/4110cbf4-d46e-4526-9bff-9074da38e56e | 200 | 200 | **PASS** | Successfully updated details |
| DELETE Driver (Admin) | DELETE | /drivers/4110cbf4-d46e-4526-9bff-9074da38e56e | 204 | 204 | **PASS** | Successfully deleted driver |
