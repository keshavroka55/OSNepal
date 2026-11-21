# Open Source Nepal

> A community where Nepal's builders turn ideas into meaningful projects together.

Developers, students, designers, founders and investors share ideas, get outside feedback, find teammates and build open source projects and startups. Think Product Hunt + LinkedIn + GitHub, for Nepal.

## What it does

| Need | Feature |
| --- | --- |
| "I have an idea and want outside validation" | List any project as **Startup, Open Source, Learning, Idea or Hardware**. Likes, threaded feedback, and an **Ideas & Feedback** board (built on the Ecosystem spaces). |
| "I want to contribute and learn" | **Discover** with filters (type, category, stage, *looking for*). **Request to join** a project with a role and message. |
| "I need a co-founder or a designer" | **People** directory searchable by skill, location and role. Connect and message. |
| "Prove my work in an interview" | Team members list **contributions** on a project; owners **verify** them. Your public profile (`/u/:username`) is the showcase. |
| "Who is leading?" | **Leaderboard** by period (today/week/month/all), type, category and investor mark. Builders leaderboard by reputation. |
| "Recognise progress" | **Badges** awarded automatically (First Launch, Team Player, Core Contributor, Investor Backed, ...). |
| Investors | **Deal flow** ranked by traction. Request the **Investor mark** on a project; an **admin** approves it. Only admin-*verified* investors can ask. |
| Admins | Console with stats, Investor-mark queue, investor verification, users, categories, moderation. |

Roles: `developer`, `investor`, `admin`. Sign-up offers developer or investor; admins are created with `npm run create-admin`.

## Stack

| Area | Tech |
| --- | --- |
| Client (`client/`) | React 19, Vite 7, TypeScript, Tailwind v4 (design tokens in `src/styles/tokens.css`, light + dark), React Router 7, Socket.io client |
| API (`back-end/`) | Express 5 (ESM), Prisma 7 + PostgreSQL, Redis cache-aside, Socket.io, JWT in httpOnly cookies, Google OAuth, Zod |
| Deploy | Docker Compose behind Nginx, GitHub Actions |

This project grew from the MakeSuperAI launch-platform codebase (auth, projects, likes, comments, bookmarks, connections, real-time chat, ecosystem, moderation, CI/deploy) and adds the Open Source Nepal layer on top.

## Run locally

```bash
# 1. API
cd back-end
cp .env.example .env          # set DATABASE_URL, JWT_SECRET (openssl rand -hex 48), Google keys
npm install
npx prisma migrate dev
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-strong-password' npm run create-admin
npm run seed:spaces           # Ideas, Feedback, Co-founder Hub, ...
npm run seed:badges
npm run seed:demo             # optional: Nepal-flavoured demo users and projects (dev only)
npm run dev                   # http://localhost:8000

# 2. Client
cd client
cp .env.example .env
npm install
npm run dev                   # http://localhost:3000
```

Demo logins after `seed:demo` (password `OpenSourceNepal1!`): `keshav@example.com` (developer), `rajan@example.com` (verified investor). Run `create-admin` first and re-run `seed:demo` to get an approved Investor mark.

## Checks

```bash
cd back-end && npm test                                   # Vitest + Supertest
cd client && npm run typecheck && npm run build:check     # types, build, bundle budget
```

## Where things are

```
back-end/src/modules/
  joinRequests/   request -> accept/decline -> team member + connection
  contributions/  list + owner verification
  investors/      deal flow, Investor-mark requests, admin review
  badges/         definitions + automatic awarding
  notifications/  persisted + pushed over Socket.io
  people/         directory, skills, summary
  leaderboards/   /rankings with period/type/category filters
client/src/
  components/shell/AppShell.tsx   sidebar + topbar, role-aware nav
  components/nepal/ui.tsx         shared building blocks
  features/nepal/                 types, API client, labels
  pages/nepal/                    Home, Discover, ProjectDetail, CreateProject, People,
                                  Leaderboard, Ideas, Profile, Workspace, Investor, Onboarding
```

## Rules worth knowing

- Project owners can only edit whitelisted fields. `investorBacked`, `status`, counters and ownership are never accepted from the client.
- The Investor mark requires: investor account -> admin verification -> request -> admin approval. Admins can revoke it.
- Accepting a join request also creates an accepted connection so teammates can message each other.
- Reputation: +2 per like received, +5 for a join accepted (both sides), +10 per verified contribution.

## Docs

- [Architecture](docs/ARCHITECTURE.md) · [API reference](docs/API.md) · [Deploying](docs/DEPLOY.md) · [Production readiness](docs/PRODUCTION_READINESS.md)
# OSNepal
