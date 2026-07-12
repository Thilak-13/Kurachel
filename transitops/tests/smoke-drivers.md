# Driver CRUD Smoke Test Logs

Run timestamp: 2026-07-12T10:21:01.451Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| GET Driver Directory List | GET | /drivers | 200 | 200 | **PASS** | Count: 10 |
| GET Drivers filtered by ?status=Available | GET | /drivers?status=Available | 200 | 200 | **PASS** | Filtered count: 8 |
| POST Create Valid Driver (Admin) | POST | /drivers | 201 | 201 | **PASS** | Created ID: 1a6d62db-5c43-443a-8d27-47dc718a32d6 |
| POST Invalid status enum (400) | POST | /drivers | 400 | 400 | **PASS** | VALIDATION_ERROR |
| POST Create Driver - Forbidden role (Driver) | POST | /drivers | 403 | 403 | **PASS** | FORBIDDEN |
| PUT Update Driver details (Admin) | PUT | /drivers/1a6d62db-5c43-443a-8d27-47dc718a32d6 | 200 | 200 | **PASS** | Successfully updated details |
| DELETE Driver (Admin) | DELETE | /drivers/1a6d62db-5c43-443a-8d27-47dc718a32d6 | 204 | 204 | **PASS** | Successfully deleted driver |
