# Deploying

Production runs `docker-compose.prod.yml` (API + PostgreSQL) behind a host Nginx that serves `client/dist` and proxies `/api`, `/uploads` and the WebSocket.

## First time

1. Copy `.env.production.example` to `.env` (compose variables) and `back-end/.env.example` to `back-end/.env`. The API **will not start** if a required value is missing or `JWT_SECRET` is shorter than 32 characters.
2. `docker compose -f docker-compose.prod.yml up -d --build`. The container runs `prisma migrate deploy` on start, which applies the Ecosystem migration.
3. Create the first admin, then seed spaces:
   ```bash
   docker compose -f docker-compose.prod.yml exec -e ADMIN_EMAIL=you@example.com -e ADMIN_PASSWORD='long-passphrase' api npm run create-admin
   docker compose -f docker-compose.prod.yml exec api npm run seed:spaces
   ```

## Every deploy

Pushing to `main` runs CI (backend tests, client typecheck, build and bundle budget) and, only if it passes, deploys over SSH. `rollback.yml` is unchanged.

## Known gaps

- The compose file has **no Redis**. Set `REDIS_URL` to a managed Redis or add a service; without it the app works but nothing is cached.
- Deploys still build on the server and use `git reset --hard`. Moving to CI-built, commit-tagged images is on the list in `PRODUCTION_READINESS.md`.
- No automated database backups yet. Until that exists, schedule `pg_dump` from the host.
