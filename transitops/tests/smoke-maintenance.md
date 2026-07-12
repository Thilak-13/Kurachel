# Maintenance Business Rules Smoke Test Logs

Run timestamp: 2026-07-12T11:29:44.223Z

| Test Name | Method | Endpoint | Expected | Actual | Result | Remarks |
| --- | --- | --- | --- | --- | --- | --- |
| Maintenance close on Retired vehicle | POST | /maintenance/:id/close | Retired | Retired | **PASS** | Retired status dominates and remains unchanged. |
| Maintenance override on active trip vehicle | POST | /maintenance | In Shop | In Shop | **PASS** | Emergency grounding successfully forced vehicle to In Shop status. |
