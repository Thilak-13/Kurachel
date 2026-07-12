# Driver CRUD Smoke Test Logs

Run timestamp: 2026-07-12T07:45:07.535Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| GET Driver Directory List | GET | /drivers | 200 | 200 | **PASS** | Count: 5 |
| GET Drivers filtered by ?status=Available | GET | /drivers?status=Available | 200 | 200 | **PASS** | Filtered count: 3 |
| POST Create Valid Driver (Admin) | POST | /drivers | 201 | 201 | **PASS** | Created ID: 6bea573b-6dfd-4f13-821c-b7899465e8b1 |
| POST Invalid status enum (400) | POST | /drivers | 400 | 400 | **PASS** | VALIDATION_ERROR |
| POST Create Driver - Forbidden role (Driver) | POST | /drivers | 403 | 403 | **PASS** | FORBIDDEN |
| PUT Update Driver details (Admin) | PUT | /drivers/6bea573b-6dfd-4f13-821c-b7899465e8b1 | 200 | 200 | **PASS** | Successfully updated details |
| DELETE Driver (Admin) | DELETE | /drivers/6bea573b-6dfd-4f13-821c-b7899465e8b1 | 204 | 204 | **PASS** | Successfully deleted driver |
