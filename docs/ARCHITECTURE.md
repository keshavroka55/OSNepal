# Architecture

## Backend (`back-end/src`)

Every feature is a module: `modules/<feature>/{feature.routes.js, feature.controller.js, feature.service.js}`. Routes declare middleware and validation, controllers are thin, services hold the logic and the Prisma calls. Nothing sits deeper than that. Small `*.schema.js` (Zod) and `*.dto.js` files live beside the module that uses them.

Cross-cutting pieces:

- `config/config.js` validates the environment at startup and exits with a list of the invalid variable names (never values).
- `middleware/originCheck.js` is the CSRF defence for cookie auth: mutating requests with an `Origin` outside `CLIENT_URL` get a 403.
- `middleware/errorHandler.js` is the only place errors become responses. 5xx messages are generic in production.
- `middleware/cacheAside.js` wraps Redis. Failures never throw; the app works without Redis, just uncached.
- `lib/realtime.js` is a handle on the one Socket.io server, so services can emit without importing the HTTP server.

## Ecosystem

```
Space ──< SpaceMember (MEMBER | MODERATOR | OWNER)
Space ──< Post ──< PostComment (self-referencing, soft-deleted)
Post  ──< PostVote, PostSave, PostTag >── Tag
PostComment ──< CommentVote
Report (POST | COMMENT target, OPEN | RESOLVED | DISMISSED)
Post.startupId ──> Startup (optional link between a discussion and a launch)
```

Rules worth knowing:

- **Counters** (`score`, `commentCount`, `replyCount`, `memberCount`) change only inside the same transaction as the row that causes them.
- **Hot ranking** is `score / (ageHours + 2)^1.5`, in `utils/hotRank.js`. It is recomputed on every vote and by a 10-minute job (`refreshHotScores`) for posts under 7 days old.
- **Feeds** use cursor pagination. The cursor is the sort value plus the row id, so ordering is stable.
- **Roles** are checked in the service layer. Site admins count as moderators everywhere.
- **Moderation**: moderators remove or lock posts and delete comments in their space. Admins work the report queue (`/dashboard/moderation`).
- **Spam throttle**: accounts under 48 hours old cannot post links (`utils/spamGuard.js`). Post, comment, vote and report actions each have their own per-user rate limit.
- **Markdown** is stored as written and sanitised on output; the client also renders without raw HTML.
- **Realtime**: signed-in clients join `post:<id>` rooms for live comment counts and a personal `user:<id>` room for `reply:new` events. All over the existing Socket.io connection.

## Client (`client/src`)

- `styles/tokens.css` is the single source of truth for colour, type, radius and elevation. Components use semantic classes (`bg-surface`, `text-text-muted`, `border-border`, `bg-primary`) and need almost no `dark:` prefixes.
- Theme is light / dark / system. An inline script in `index.html` applies it before first paint; `contexts/ThemeContext.tsx` keeps it in sync.
- `features/<name>/{components, hooks, api, types}` for new work (see `features/ecosystem`). `pages/` should only compose.
- `routes/AppRoutes.tsx` lazy-loads every page and redirects the old route names.
