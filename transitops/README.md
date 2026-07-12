# TransitOps

TransitOps is a transit operations management web application structured with a frontend React application, an Express backend service, and shared business logic/validation rules.

## Directory Structure

```
transitops/
├── frontend/                          [React SPA / Vite]
├── backend/                           [Express HTTP Server]
├── shared/                            [Shared Rules and Enums]
├── tests/                             [Smoke tests and Postman collection]
└── README.md
```

## Running the Project

1. Install dependencies inside `frontend` and `backend`:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Start the Backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Start the Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
