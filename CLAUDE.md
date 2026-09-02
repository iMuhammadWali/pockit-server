# pockit-server

Backend REST API for **pockit** — a personal finance / wallet-tracking app. Express server with MongoDB persistence and JWT-based auth.

## Stack

- **Node.js + Express 5** — ES Modules (`"type": "module"`, so always use `import`, not `require`)
- **Mongoose 9** — MongoDB ODM (Atlas, `mongodb+srv`)
- **jsonwebtoken** — access tokens (JWT), 15m expiry
- **dotenv** — env config
- **crypto** (Node built-in) — sha256 hashing for passwords & refresh tokens
- **nodemon** — dev runner

## Commands

- `npm run dev` — start with nodemon (entry: `server.js`). Listens on `PORT` from `.env`.

## Getting started

1. Copy `.env` variables (see **Env** below) — `.env` is gitignored and holds real secrets; never commit it.
2. `npm install`
3. `npm run dev`

## Project structure

```
server.js                      # entry: connect DB, create app, listen
client.js                      # manual test script (gitignored)
src/
  app.js                       # createApp(): express.json, mount routers, errorHandler last
  config/config.js             # loads .env, validates MONGO_URI & JWT_SECRET, exports config
  db/index.js                  # connectToDB(); sets dns.setServers(["1.1.1.1","8.8.8.8"]) (Atlas DNS workaround)
  controllers/                 # business logic per resource (auth, wallet, health)
  middleware/
    auth.middleware.js         # authHandler: verifies Bearer JWT → sets req.user
    error.middleware.js        # ApiError → status/message, else 500
  models/                      # Mongoose models (user, session, wallet)
  routes/                      # one router per resource, wraps controllers in catchAsync
  utils/
    apiError.util.js           # ApiError(status, message)
    catchAsync.util.js         # wraps async handlers → next(err)
    formatList.util.js         # "a, b and c are required." message builder
  views/health.view.js         # getHealthHTML() — styled health status page
```

## Conventions

- **Layering:** route → `catchAsync(controller)` → controller does validation + DB + response. `catchAsync` forwards thrown `ApiError`s to the central `errorHandler`.
- **Errors:** throw `ApiError(status, message)` from controllers; never hand-roll error responses. `errorHandler` maps `ApiError` → `{ message }` with its status, anything else → `console.error` + 500.
- **Responses:** consistent `{ message, ...data }` shape. Auth returns `message`, `user`, `accessToken`, `refreshToken`; wallet routes return `message` + `wallet`/`wallets`.
- **Validation:** manual per-controller validators (e.g. `getWalletValidationError`) building messages with `formatList`, not schema-driven. Validate shape, then throw `ApiError(400, ...)`.
- **Scoping:** DB queries are always scoped to the authed user (`userId: user._id`) — no cross-user reads.
- **Imports:** grouped with `// third-party`, `// config`, `// models`, `// middleware`, `// utils`, `// views` comment banners (auth.controller.js and app.js use this style).
- **ESM:** every file is an ES module; export one default + named functions.

## Auth flow

- **Register** (`POST /api/auth/register`): validates username/email/password → 409 if username or email exists → sha256-hashes password → creates user. Returns 201 (no token).
- **Login** (`POST /api/auth/login`): finds by email, compares sha256 password hash via `crypto.timingSafeEqual` → issues a 15m JWT **access token** + a random 32-byte hex **refresh token**.
- **Refresh token:** never stored raw — hashed (sha256) into a `sessions` doc (`userId`, `refreshTokenHash`, `expiresAt` +30d, `revokedAt`). **Rotation** (`POST /api/auth/rotate`): validates session not revoked/expired, issues new access + refresh, updates the session in place. **Logout** (`POST /api/auth/logout`): marks the matching session `revokedAt`.
- **get-me** (`GET /api/auth/get-me`): verify Bearer token, return username/email.
- **Protected routes:** `/api/wallets` uses `authHandler` (sets `req.user`). Auth routes are public.

## Data models

- **users:** `username` (unique), `email` (unique), `password` (sha256 hash).
- **sessions:** `userId`, `refreshTokenHash`, `createdAt`, `expiresAt`, `revokedAt` (default null).
- **wallets:** `userId`, `name`, `balance` (default 0, may go negative — represents debt by design). **Unique compound index** `{ userId, name }` → duplicate name for a user is caught as Mongo `11000` and surfaced as `ApiError(409)`.

## Env

Required (validated in `config.js`): `MONGO_URI`, `JWT_SECRET`. Optional: `PORT` (default 3000), `PRODUCTION` (unused so far). Values live in the gitignored `.env` — do not log or commit them.

## Gotchas

- **Passwords are sha256, not bcrypt/argon2** — a deliberate (and currently weak) choice; flag it before extending auth.
- `getMe` in `auth.controller.js` declares `decoded` inside the `try` block and references it after — out of scope → ReferenceError → 500. Needs a fix (declare `decoded` outside the try).
- `db/index.js` pins DNS servers to 1.1.1.1/8.8.8.8 — a workaround for Atlas connection issues; don't remove casually.
- `client.js` and `claude-local.ps1` are local tooling, gitignored.
- Wallet balance has no `min` constraint (negative = debt, see comment in `wallet.model.js`).

## Git

Main branch is `main`; active work is on `feature/wallet`. Recent history: auth system (register/login/logout/refresh rotation) then wallet CRUD. `src/app.js` has uncommitted changes in the working tree.
