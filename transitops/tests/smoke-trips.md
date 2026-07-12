# Trip Business Rules Smoke Test Logs

Run timestamp: 2026-07-12T08:03:33.985Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| Dispatch with overweight cargo | POST | /trips | 400 | 400 | **PASS** | Cargo weight of 1500 kg exceeds vehicle max capacity of 1000 kg |
| Dispatch with Suspended driver | POST | /trips | 400 | 400 | **PASS** | Driver is not available (Current status: INACTIVE) |
| Dispatch with expired license | POST | /trips | 400 | 400 | **PASS** | Driver license is expired (Expiry date: 2020-01-01) |
| Double-dispatch race condition locking | POST | /trips/:id/dispatch (concurrent) | One 200, One 400 | A: 200, B: 400 | **PASS** | Database transaction correctly blocked double-booking. |
| Cancel completed trip | POST | /trips/:id/cancel | 400 | 400 | **PASS** | Only Dispatched (en route) trips can be cancelled. Current status: Completed |
