# fullstack-auth-platform

A real authentication service: Node.js/Express + TypeScript + MongoDB backend with bcrypt password hashing, short-lived JWT access tokens, and rotating opaque refresh tokens (hash-only storage, reuse detection) — paired with a React 18 + TypeScript SPA that consumes it. First Node.js entry in the portfolio, and the first repo using MongoDB (a genuinely different database model from the SQL/H2 used elsewhere).

## Why it exists

Auth is deceptively easy to get wrong in ways that only surface under attack — storing tokens in plaintext, never rotating refresh tokens, no rate limiting on login. This repo picks the boring, correct choices deliberately and documents *why*, rather than the shortest path to a working login form.

## Independent, non-proprietary disclaimer

A fabricated auth service built solely to demonstrate the pattern; no employer code or data.

## Architecture

```
fullstack-auth-platform/
├── backend/
│   ├── src/modules/auth/       register/login/refresh/logout, token utilities, validation (zod)
│   ├── src/modules/user/           Mongoose User model (bcrypt hash, refresh-token hash + expiry)
│   ├── src/middleware/                  JWT authentication guard, centralized error handler
│   └── src/test/                            Jest + Supertest + a real in-memory MongoDB (no Docker)
├── frontend/
│   ├── src/api/client.ts                        Typed fetch client
│   ├── src/context/AuthContext.tsx                  Tokens held in React state only (see Security)
│   └── src/components/                                  LoginForm, RegisterForm, Dashboard
├── docker-compose.yml                                        mongo + backend (3000) + nginx frontend (8082)
└── .github/workflows/ci.yml                                      Two independent jobs: backend, frontend
```

## Key design decisions

- **Refresh tokens are random opaque strings, never JWTs.** A JWT is stateless by design — it can't be revoked before it expires. A refresh token needs exactly that property (logout, rotation-on-reuse), so it's a `crypto.randomBytes` string whose SHA-256 hash is the only thing ever persisted (`token.util.ts`).
- **Every successful refresh rotates the token and invalidates the one just used.** Reusing an already-rotated refresh token fails outright (`auth.service.ts`'s `refresh` function) — proven in `auth.test.ts`'s rotation test, which asserts the *old* token stops working immediately after one refresh.
- **Login, specifically, is rate-limited** (`express-rate-limit`, 10 attempts/15 min) — register and refresh aren't, since credential-stuffing targets login, not account creation.
- **The frontend keeps tokens in React state only, never localStorage.** A page reload requires signing in again; the tradeoff is documented directly in `AuthContext.tsx` rather than silently accepted — an httpOnly-cookie refresh flow would be the production answer, and isn't implemented here.
- **Password hashing uses bcrypt at 12 rounds**, industry-standard cost for password storage as of this writing.

## Security

- Passwords: bcrypt, 12 rounds, never logged or returned in any response.
- Refresh tokens: opaque random strings; only their SHA-256 hash is stored; single-use via rotation.
- `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` have no production default — the server won't start without them, so a missing secret fails loudly instead of running unauthenticated-by-accident. Tests use fixed values only under `NODE_ENV=test`.
- `helmet` for standard security headers, `cors` explicitly enabled (open by default here for a local dev tool; a real deployment would scope `origin`).

## Testing pyramid

- **9 backend integration tests** (`auth.test.ts`) against a **real MongoDB** instance via `mongodb-memory-server` — an actual `mongod` binary runs for the test suite, not a mock. Covers: registration, duplicate-email rejection, password-length validation, login success/failure, protected-route access with/without a token, refresh rotation (including reuse rejection), unknown-refresh-token rejection, and logout revocation.
- **4 frontend tests** (`App.test.tsx`, API client mocked) covering register → dashboard, login → dashboard, a failed-login error banner, and logout → back to the login form.

## What was and wasn't verified

- All 9 backend tests pass against a real embedded MongoDB; a real finding along the way: the default 10-second Mongo startup watcher was too tight for this machine's first-run disk I/O (confirmed via `MONGOMS_DEBUG=1` that `mongod` itself finished initializing fine) — fixed with an explicit longer `launchTimeout`, not by giving up on a real database.
- A real `@types/jsonwebtoken` type error (a `string` TTL like `"15m"` isn't assignable to the library's narrowed `expiresIn` type) was hit and fixed by switching to a plain number of seconds.
- Frontend tests initially failed with a "multiple elements" error because the heading and the submit button were both literally "Log in" — fixed by querying the button by ARIA role instead of text, a real accessibility-adjacent testing lesson, not a contrived one.
- **Not run against real infrastructure:** no live MongoDB server, no Docker (unavailable in this environment) — `docker-compose.yml` is written and reviewed but not executed.

## Development

```bash
cd backend
cp .env.example .env   # set real JWT secrets
npm install
npm test                 # real in-memory MongoDB, no Docker needed
npm run dev               # needs a running MongoDB (local or Atlas)

cd ../frontend
npm install
npm test
npm run dev                # proxies /api to localhost:3000
```

### Both, via Docker

```bash
JWT_ACCESS_SECRET=... JWT_REFRESH_SECRET=... docker compose up --build
```

## License

MIT © sangiya
