# Trip Business Rules Smoke Test Logs

Run timestamp: 2026-07-12T08:45:07.269Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| Dispatch with overweight cargo | POST | /trips/:id/dispatch | 400 | 400 | **PASS** | Cargo weight of 800 kg exceeds vehicle max capacity of 500 kg |
| Create trip with Suspended driver | POST | /trips | 400 | 400 | **PASS** | Trip creation correctly blocked for suspended driver. |
| Dispatch with expired license | POST | /trips/:id/dispatch | 400 | 400 | **PASS** | Driver license is expired (Expiry date: 2020-01-01) |
| Double-dispatch race condition locking | POST | /trips/:id/dispatch (concurrent) | One 200, One 400 | A: 200, B: 400 | **PASS** | Database transaction correctly blocked double-booking. |
| Cancel completed trip | POST | /trips/:id/cancel | 400 | 400 | **PASS** | Only Dispatched (en route) trips can be cancelled. Current status: Completed |
| License expiry at dispatch (TOCTOU gap) | POST | /trips/:id/dispatch | 400 | 400 | **PASS** | Dispatch correctly rejected expired license after trip creation. |
