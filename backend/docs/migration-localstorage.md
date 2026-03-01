# Backend Migration Path (LocalStorage -> Postgres)

## 1) Start backend service
1. `cd backend`
2. copy `.env.example` to `.env`
3. create Postgres DB `physioconnect`
4. run SQL in `db/schema.sql`
5. run `npm install && npm run dev`

## 2) Export localStorage data from browser
Open app in browser console and run:

```js
const payload = {
  users: JSON.parse(localStorage.getItem('physioconnect_users') || '[]'),
  bookings: JSON.parse(localStorage.getItem('physioconnect_bookings') || '[]'),
  payments: JSON.parse(localStorage.getItem('physioconnect_payments') || '[]'),
  relationships: JSON.parse(localStorage.getItem('physioconnect_relationships') || '[]'),
  carePlans: JSON.parse(localStorage.getItem('physioconnect_care_plans') || '[]'),
  sessionHistory: JSON.parse(localStorage.getItem('physioconnect_session_history') || '[]')
};
copy(JSON.stringify(payload));
```

## 3) Import into backend
1. Login as admin through `/api/auth/login` to get access token.
2. POST payload JSON to `/api/migration/import-localstorage` with `Authorization: Bearer <token>`.

## 4) Cutover strategy
1. Keep frontend in local mode as fallback.
2. Add API feature flag in frontend (`VITE_USE_BACKEND=true`).
3. Switch reads/writes context-by-context (Auth -> Bookings -> Relationships -> Reports).
4. Keep migration endpoint disabled in production after cutover.
