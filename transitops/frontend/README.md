# Kurachel Frontend

This directory contains the React SPA built using Vite and styled with Tailwind CSS.

## Completed Block 2 Features:
- **Vehicle Management**: Responsive table listing registration numbers, max loads, odometers, and costs. Integrates add/edit modal forms, custom confirm dialogs, and instant search/filters by status and vehicle type.
- **Driver Management**: Driver roster directory tracking license categories, license expiry dates, contact numbers, and safety scores. Integrates full adding/editing form modals with inline validations.
- **Reusable UI Components**:
  - `StatusBadge` for vehicle & driver states.
  - `SearchBar` for dynamic instant table queries.
  - `FilterDropdown` for data filtering.
  - `ConfirmDialog` for modal-based delete safeguards.
  - `Toast` for non-obtrusive visual success/error notifications.
- **Client Storage Persistence**: Implemented in-memory and `localStorage` CRUD mutations in `vehicleApi.js` and `driverApi.js`.
