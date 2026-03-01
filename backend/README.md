# Physioconnect Backend (Production Track)

This is a new API service for turning the current SPA into a hostable business system.

## Stack
- Node.js + Express
- PostgreSQL (`pg`)
- JWT access/refresh auth
- Role authorization (`customer`, `therapist`, `admin`)

## Implemented API groups
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/bookings/complete`
- `GET /api/relationships/active/customer/:customerId`
- `GET /api/relationships/active/therapist/:therapistId`
- `GET /api/care-plans/customer/:customerId`
- `GET /api/care-plans/therapist/:therapistId`
- `GET /api/session-history/customer/:customerId`
- `GET /api/session-history/therapist/:therapistId`
- `POST /api/migration/import-localstorage`

## Run locally
1. `cd backend`
2. `copy .env.example .env` (Windows) and fill secrets
3. Apply `db/schema.sql` in your Postgres DB
4. `npm install`
5. `npm run dev`

## Notes
- This backend is scaffolded to match your current frontend domain model.
- Frontend still runs as-is until you wire API calls behind a feature flag.
