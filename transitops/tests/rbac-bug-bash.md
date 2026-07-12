# RBAC Bug Bash Report

Run: 2026-07-12T10:17:39.994Z

| Role | Action | Expected | Actual | Result |
|---|---|---|---|---|
| Admin | Create Vehicle | ALLOW | ALLOW | **PASS** |
| Admin | View Vehicles | ALLOW | ALLOW | **PASS** |
| Admin | View Drivers | ALLOW | ALLOW | **PASS** |
| Admin | Create Driver | ALLOW | ALLOW | **PASS** |
| Admin | View Trips | ALLOW | ALLOW | **PASS** |
| Admin | View Maintenance | ALLOW | ALLOW | **PASS** |
| Admin | View Reports | ALLOW | ALLOW | **PASS** |
| Admin | View Dashboard KPIs | ALLOW | ALLOW | **PASS** |
| Fleet Manager | Create Vehicle | ALLOW | ALLOW | **PASS** |
| Fleet Manager | View Vehicles | ALLOW | ALLOW | **PASS** |
| Fleet Manager | View Drivers | ALLOW | ALLOW | **PASS** |
| Fleet Manager | Create Driver | ALLOW | ALLOW | **PASS** |
| Fleet Manager | View Trips | DENY | DENY(403) | **PASS** |
| Fleet Manager | View Maintenance | DENY | DENY(403) | **PASS** |
| Fleet Manager | View Reports | ALLOW | ALLOW | **PASS** |
| Fleet Manager | View Dashboard KPIs | ALLOW | ALLOW | **PASS** |
| Dispatcher | Create Vehicle | DENY | DENY(403) | **PASS** |
| Dispatcher | View Vehicles | ALLOW | ALLOW | **PASS** |
| Dispatcher | View Drivers | ALLOW | ALLOW | **PASS** |
| Dispatcher | Create Driver | DENY | DENY(403) | **PASS** |
| Dispatcher | View Trips | ALLOW | ALLOW | **PASS** |
| Dispatcher | View Maintenance | ALLOW | ALLOW | **PASS** |
| Dispatcher | View Reports | DENY | DENY(403) | **PASS** |
| Dispatcher | View Dashboard KPIs | ALLOW | ALLOW | **PASS** |
| Maintenance Manager | Create Vehicle | DENY | DENY(403) | **PASS** |
| Maintenance Manager | View Vehicles | DENY | DENY(403) | **PASS** |
| Maintenance Manager | View Drivers | DENY | DENY(403) | **PASS** |
| Maintenance Manager | Create Driver | DENY | DENY(403) | **PASS** |
| Maintenance Manager | View Trips | DENY | DENY(403) | **PASS** |
| Maintenance Manager | View Maintenance | ALLOW | ALLOW | **PASS** |
| Maintenance Manager | View Reports | ALLOW | ALLOW | **PASS** |
| Maintenance Manager | View Dashboard KPIs | ALLOW | ALLOW | **PASS** |
| Driver | Create Vehicle | DENY | DENY(403) | **PASS** |
| Driver | View Vehicles | ALLOW | ALLOW | **PASS** |
| Driver | View Drivers | DENY | DENY(403) | **PASS** |
| Driver | Create Driver | DENY | DENY(403) | **PASS** |
| Driver | View Trips | ALLOW | ALLOW | **PASS** |
| Driver | View Maintenance | DENY | DENY(403) | **PASS** |
| Driver | View Reports | DENY | DENY(403) | **PASS** |
| Driver | View Dashboard KPIs | DENY | DENY(403) | **PASS** |
