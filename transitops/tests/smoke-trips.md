# Trip Business Rules Smoke Test Logs

Run timestamp: 2026-07-12T07:43:23.411Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| Dispatch with overweight cargo | POST | /trips/:id/dispatch | 400 | 400 | **PASS** | Cargo weight exceeds vehicle capacity |
| Dispatch with Suspended driver | POST | /trips/:id/dispatch | 400 | 400 | **PASS** | Driver is not available for dispatch |
| Dispatch with expired license | POST | /trips/:id/dispatch | 400 | 400 | **PASS** | Driver license is expired or suspended |
| Double-dispatch race condition locking | POST | /trips/:id/dispatch (concurrent) | One 200, One 400 | A: 200, B: 400 | **PASS** | Database transaction correctly blocked double-booking. |
| Cancel completed trip | POST | /trips/:id/cancel | 400 | 400 | **PASS** | Cannot cancel a completed trip |
