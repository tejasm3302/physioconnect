#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

if [[ ! -f .env.prod ]]; then
  echo "Missing .env.prod. Copy .env.prod.example and set real values first."
  exit 1
fi

required_vars=(DOMAIN ACME_EMAIL POSTGRES_PASSWORD JWT_ACCESS_SECRET JWT_REFRESH_SECRET)
for var in "${required_vars[@]}"; do
  if ! grep -qE "^${var}=" .env.prod; then
    echo "Missing ${var} in .env.prod"
    exit 1
  fi
done

echo "Building and starting production stack..."
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

echo "Services status:"
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

echo "Deployment complete. Visit: https://$(grep '^DOMAIN=' .env.prod | cut -d= -f2-)"