# Production Readiness Checklist

## 1. Security
- Replace JWT secrets in backend environment.
- Enable HTTPS and secure cookies (`secure: true`) in production.
- Restrict CORS to your domain only.
- Add WAF/rate-limiting at ingress (Cloudflare/Nginx/Kong).
- Keep `ALLOW_MIGRATION_IMPORT=false` in production.

## 2. Infrastructure
- Use managed Postgres with backups + point-in-time recovery.
- Run backend behind reverse proxy with TLS termination.
- Configure separate environments: dev/staging/prod.

## 3. Operations
- Add CI pipeline: lint/test/build/deploy.
- Add runtime monitoring: uptime, error rate, latency, DB health.
- Add structured logs + central log sink.

## 4. Data Migration
- Temporarily set `ALLOW_MIGRATION_IMPORT=true` only during migration.
- Export localStorage payload from current app.
- Import via `/api/migration/import-localstorage` as admin.
- Validate user/booking/payment counts before cutover.
- Set `ALLOW_MIGRATION_IMPORT=false` immediately after import.

## 5. Frontend Cutover
- Set `VITE_USE_BACKEND=true` and `VITE_API_BASE_URL=/api`.
- Validate auth, booking completion, relationships, care plans, history.
- Keep rollback path (local mode build) during first launch week.

## 6. Business Controls
- Add payment gateway server-side verification webhook.
- Add audit trail table for admin actions.
- Add GDPR/consent and data retention policy docs.