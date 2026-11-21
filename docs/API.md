# API

Base path `/api`. Authentication is a JWT in an httpOnly cookie. Mutating requests from a browser must come from an origin listed in `CLIENT_URL`. Validation errors return `400 { message, details: [{ path, message }] }`.

There is no generated Swagger document yet; this file is maintained by hand and covers the Ecosystem. Older modules (startups, votes, comments, users, chat) are in `back-end/src/modules/*/*.routes.js`.

## Spaces

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/spaces` | optional | Public spaces, plus private ones you belong to |
| GET | `/spaces/:slug` | optional | Includes `viewerRole` and moderators |
| POST | `/spaces` | yes | Creator becomes OWNER |
| POST | `/spaces/:slug/join` | yes | Private spaces are invite-only (not yet possible) |
| DELETE | `/spaces/:slug/join` | yes | Owners cannot leave |

## Posts

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/posts?sort=hot\|new\|top&cursor=&limit=&space=&author=&startup=` | optional | Returns `{ items, nextCursor }` |
| GET | `/posts/:id` | optional | |
| POST | `/posts` | yes, member | Types: DISCUSSION, QUESTION, SHOWCASE, LINK. Rate limited |
| PATCH | `/posts/:id` | author | Title and body only |
| DELETE | `/posts/:id` | author or moderator | Soft delete |
| POST | `/posts/:id/vote` | yes | `{ value: 1 \| -1 \| 0 }`, 0 clears |
| POST | `/posts/:id/save` | yes | Toggles |
| POST | `/posts/:id/moderate` | moderator | `{ action: remove \| restore \| lock \| unlock }` |

## Comments

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/post-comments/post/:postId?sort=best\|new&cursor=` | optional | Top-level page with 3 levels of replies; deeper replies via `replyCount` |
| GET | `/post-comments/:id/replies` | optional | "Load more replies" |
| POST | `/post-comments/post/:postId` | yes | `{ body, parentId? }`. Blocked on locked posts |
| PATCH | `/post-comments/:id` | author | |
| DELETE | `/post-comments/:id` | author or moderator | Leaves a placeholder so replies keep context |
| POST | `/post-comments/:id/vote` | yes | `{ value }` |

## Reports and moderation

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/reports` | yes | `{ targetType: POST \| COMMENT, targetId, reason }`. One per user per target |
| GET | `/reports?status=OPEN` | admin | The moderation queue |
| PATCH | `/reports/:id` | admin | `{ status: RESOLVED \| DISMISSED, removeTarget }` |

## Other additions

- `POST /media/post-image` (multipart field `image`): re-encoded to WebP, returns `{ url }`.
- `GET /startups/mine`: the signed-in founder's startups, for the post composer.
- `GET /health`: liveness probe.

## Realtime (Socket.io)

Client emits `post:join` / `post:leave` with a post id. Server emits `post:commentCount { postId, commentCount }` to that room and `reply:new { postId, commentId, from }` to the person being replied to.


---

# Open Source Nepal endpoints

All paths are under `/api`. "Auth" = signed-in (cookie). Errors are `{ "message": "..." }`.

| Method & path | Who | Purpose |
| --- | --- | --- |
| `GET /startups?type&stage&category&lookingFor&backed&sort&search&page&limit` | public | Filterable project list (`type`: STARTUP, OPEN_SOURCE, LEARNING, IDEA, HARDWARE; `sort`: new/top) |
| `POST /startups` / `PUT /startups/:id` | auth / owner | Create or edit. Edits are whitelisted; admins may also set `status`, `featured` |
| `PUT /users/me/onboarding` | auth | First-run profile; one-time choice of developer or investor |
| `GET /people?q&skill&role&location` | public | People directory |
| `GET /people/top`, `/people/skills`, `/people/me/summary` | public / public / auth | Top builders, skill chips, workspace counters |
| `POST /join-requests` | auth | `{ startupId, roleWanted, message }` |
| `GET /join-requests/sent`, `/received` | auth | Mine / for projects I own |
| `PATCH /join-requests/:id/respond` | owner | `{ status: ACCEPTED \| REJECTED }` |
| `DELETE /join-requests/:id` | requester | Withdraw a pending request |
| `GET /contributions/user/:id`, `/project/:id` | public | Contributions |
| `POST /contributions` | team member | `{ startupId, title, description?, url? }` |
| `PATCH /contributions/:id/verify` | project owner | Verify |
| `GET /leaderboards/rankings?period&type&category&backed&limit` | public | `period`: daily, weekly, monthly, all |
| `GET /badges`, `/badges/me`, `/badges/user/:id` | public / auth / public | Catalog and earned badges |
| `GET /notifications`, `/unread-count`; `POST /read-all`; `PATCH /:id/read` | auth | Notifications (also pushed as socket event `notification`) |
| `GET /investors/deal-flow` | investor, admin | Projects ranked by traction |
| `POST /investors/interest` | verified investor | `{ startupId, note? }` request the Investor mark |
| `GET /investors/interest/mine` | investor | My requests |
| `GET /investors/admin/queue?status`, `/admin/accounts` | admin | Review queue, investor accounts |
| `PATCH /investors/admin/:id` | admin | `{ status: APPROVED \| REJECTED }` |
| `DELETE /investors/admin/mark/:startupId` | admin | Revoke the mark |
| `PATCH /admin/users/:id/verify` | admin | Verify or un-verify an account |
| `GET /posts?type=IDEA\|FEEDBACK&space&sort` | public | Ideas & feedback use the Ecosystem posts |
