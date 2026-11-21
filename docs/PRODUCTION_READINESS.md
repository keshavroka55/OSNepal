# Production readiness

An honest status of the five-phase plan, so nothing is assumed done that isn't.

## Rotate these credentials now

The uploaded archive contained real `.env` files (root, `back-end/`, `client/`, plus a `back-end/.env.server`). They are removed from this copy and replaced by `.env.example` files. Assume every value in them is exposed, and check that none are tracked in git (`git ls-files | grep -i env`; if any are, `git rm --cached` them and treat history as compromised).

- `JWT_SECRET` (a secret-looking value was also sitting in a comment in `.env.server`). Rotating it signs everyone out.
- PostgreSQL password / `DATABASE_URL`
- `GOOGLE_CLIENT_SECRET` (and review the OAuth client's redirect URIs)
- `EMAIL_PASSWORD` (SMTP credentials)
- Redis password, if `REDIS_URL` pointed at a managed instance
- The admin account that `createFirstAdmin.js` used to create. Its email and password were hard-coded in the repo. If that account exists in production, change its password or delete it.

## Security problems found and fixed

1. **`POST /api/auth/keshav-register` created admin accounts with no authentication.** Removed.
2. **`PATCH /api/auth/role` let any signed-in user make themselves admin.** Removed (the client does not use it).
3. Anyone could replace **another user's avatar** (the id came from the request body) and any signed-in user could replace **any startup's logo, banner or screenshots**. Media routes now use the session user and check startup ownership.
4. The register/login controllers logged **full request bodies, including plaintext passwords**, and the socket handler logged the raw cookie header (the session token). All removed.
5. `/api/db-test` and `/api/auth/google/debug` removed.
6. The media controller referenced `__dirname`, which does not exist in ES modules, so deleting old images threw. Fixed.
7. Added helmet, an Origin allow-list for mutating requests (CSRF), a 100 kb body limit, startup environment validation, and an error handler that hides stack traces and database errors in production.

## Status by phase

| Phase | Status |
| --- | --- |
| 0 Cleanup | **Mostly done.** CRA leftovers, `next`, duplicate motion library, duplicate navbar/SEO/legal pages removed; routes renamed to kebab-case with redirects; leaked logs removed. **Not done:** splitting the six 400+ line files, merging the two-page submit into one multi-step form (routes are renamed to `/submit` and `/submit/details`), and moving every existing page into `features/` folders. |
| 1 Design system | **Mostly done.** One token file, `@theme` mapping, `tailwind.config.js` deleted, light/dark/system with no-flash script, Inter + JetBrains Mono self-hosted, contrast verified (AA in both themes), radius scale 6/8/12, dev-only `/design` page. About 360 hex classes and 290 Tailwind palette classes were converted by script. **Needs your eyes:** run through the main pages in both themes; the conversion is mechanical, so a few spots (e.g. the navy CTA block in `home.tsx`) need a human pass. |
| 2 UI refinement | **Not done**, apart from 44px touch targets on buttons, focus rings and reduced motion. Gradients (21 uses), `Sparkles` badges and `rounded-2xl/3xl` (now collapsed to 12px by the scale) remain; Home is not yet the ranked-list hero. |
| 3 Ecosystem | **Backend done and unit-tested; frontend done and type-checked.** Spaces, posts, threaded comments with real comment votes, reports, moderation, hot ranking, rate limits, spam throttle, realtime counts and reply events, admin queue, "Discussions about this product" component. **Not wired yet:** `PostDiscussions` is written but not inserted into the product page or founder profile (both files are 50 KB+; do it when they are split). |
| 4 Product completeness | **Not started** (notifications module, search, onboarding, launch states, analytics, SEO pre-rendering, OG images). |
| 5 Hardening | **Partly done:** helmet, CSRF origin check, env validation, `.env.example` files, Vitest + Supertest (21 tests), CI workflow gating deploy, bundle budget, route-level code splitting (main bundle 909 kB to 494 kB). **Not done:** S3/R2 storage, pino, Sentry, Playwright, image-based deploys, automated backups, Redis in compose, the rest of the Zod coverage on older routes. |

## Verified vs not verified

- Verified here: backend unit and API-wiring tests pass (21), Prisma schema validates, client typechecks with 0 errors, production build passes, tokens compile into the CSS.
- **Not verified:** the migration SQL and the Ecosystem services against a real PostgreSQL (the sandbox could not download Prisma's engines or run a database). The migration was written by hand following Prisma's naming. Before deploying, run `npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --shadow-database-url <scratch db>`; it should report no difference.
- Not verified: the UI in a browser, Google OAuth, email, Redis, Socket.io end to end.

## Other things noticed

- `GET /api/startups` loads every vote, comment and bookmark row for each startup. It will get slow as data grows; it should return counts.
- Redis TLS is configured with `rejectUnauthorized: false`.
- Dashboard routes have no client-side route guard (the API enforces roles, so data is safe, but the pages render empty).
- The legal pages that were not routed (`pages/legal/*`, longer than the live ones) were removed with the unused Next.js layout. If their wording was meant to replace the live text, recover them from the original archive.
