# GitHub + Docker Live Setup (No Cloud Platform)

This setup uses only:
- GitHub repo (source + deploy trigger)
- Docker on your own machine/server (frontend + backend + postgres)

Important: GitHub cannot run backend/database containers for you. Containers must run on your own machine/server.

## 1. Keep one machine as your server
- Windows/Linux machine with Docker installed
- Always ON for public access

## 2. Add GitHub self-hosted runner on that machine
GitHub repo -> Settings -> Actions -> Runners -> New self-hosted runner.
Follow the commands shown by GitHub on that machine.

## 3. Start runner service
After setup, keep runner active (or install it as a service).

## 4. Deploy automatically on push
This repo includes workflow:
- `.github/workflows/deploy-selfhosted.yml`

When you push to `main`, runner executes:
- `docker compose up -d --build`

## 5. Make it reachable from internet
Choose one:
1. Cloudflare quick tunnel (easy):
   `cloudflared tunnel --url http://localhost:80 --no-autoupdate`
2. Domain + port forwarding/TLS on your network (advanced)

## 6. Daily update flow
```bash
git add .
git commit -m "update"
git push origin main
```
GitHub Action will redeploy automatically on your runner machine.