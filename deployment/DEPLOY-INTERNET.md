# Internet Deployment (All Devices)

This deploys PhysioConnect with Docker + HTTPS so it works on phones/laptops over the internet.

## 1. VM + DNS
- Create Ubuntu 22.04+ VM
- Open ports `22`, `80`, `443`
- Create DNS `A` record: `app.yourdomain.com -> VM_PUBLIC_IP`

## 2. Upload Project
```bash
scp -r physioconnect-marketplace-application\ \(7\) user@YOUR_VM_IP:/opt/physioconnect
ssh user@YOUR_VM_IP
cd /opt/physioconnect
```

## 3. Bootstrap VM (Docker + Firewall)
```bash
sudo bash deployment/scripts/bootstrap-vm.sh
```

## 4. Configure Production Secrets
```bash
cp .env.prod.example .env.prod
nano .env.prod
```
Set real values:
- `DOMAIN`
- `ACME_EMAIL`
- `POSTGRES_PASSWORD`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## 5. Deploy
```bash
bash deployment/scripts/deploy-prod.sh
```

## 6. Verify
```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f caddy backend frontend
```
Open: `https://YOUR_DOMAIN`

## 7. One-time Data Migration (optional)
1. Temporarily set `ALLOW_MIGRATION_IMPORT=true` in `docker-compose.prod.yml` backend service
2. Redeploy backend
3. Import payload via admin migration API
4. Set `ALLOW_MIGRATION_IMPORT=false` and redeploy

## 8. Backup
```bash
docker exec -t $(docker compose --env-file .env.prod -f docker-compose.prod.yml ps -q db) \
  pg_dump -U postgres physioconnect > backup_$(date +%F).sql
```