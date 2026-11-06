# AGENTS.md

Prototype SaaS "technology radar": NestJS 11 + MongoDB (`backend/`), Angular 19 (`frontend/`). Dev machine is **Windows/PowerShell**. Owner is actively learning Angular — prefer small, reviewable changes with explanation over big rewrites. **Keep responses short** (user preference).

## Running the app

- **Backend (Docker, preferred):** `cd backend && docker compose up --build` → API on `:4000`, MongoDB on `:27017` (db `TechRadar`, user `admin` / `123456` — real values come from `docker-compose.override.yml`; the base compose file has them as empty placeholders).
- **Frontend:** `cd frontend && npm install && ng serve` → `:4200`. Talks to the backend via CORS (`origin: '*'`); no dev proxy.
- **Backend without Docker:** `npm run start:dev` (needs MongoDB on `:27017`). Env-file selection is in `app.module.ts`: `NODE_ENV` unset → `.env`, set → `.env.${NODE_ENV}` (so local dev with the dev file needs `NODE_ENV=development`).

## Package managers

- **Frontend: npm** (`package-lock.json`).
- **Backend: use npm.** README + Dockerfile both use `npm install`. The `packageManager: yarn` field and `yarn.lock` are scaffolding leftovers — do not run yarn or regenerate `yarn.lock`.

## Backend quirks

- All routes are URI-versioned: `/v1/...` (`enableVersioning` in `main.ts`).
- Auth is **manual JWT** (`jsonwebtoken`) with custom `AuthGuard`/`RolesGuard`. `passport*` and `@nestjs/swagger` are installed but **not wired in**.
- `ThrottlerModule` is configured in `app.module.ts` but no global throttler guard is applied — it is inert.
- **Env loading order matters:** `MongooseModule.forRoot(...)` reads `process.env` when the decorator arguments evaluate; `ConfigModule.forRoot(...)` earlier in the same `imports` array is what loads the `.env` file. Don't reorder/hoist these.
- In Docker, `NODE_ENV=Production` → looks for nonexistent `.env.Production`; the container relies on the compose env vars instead.
- `.env` / `.env.development` are **git-tracked** (not ignored).
- Seeding: `mongo-init.js` creates the admin user (`admin@example.com` / `Admin123!`) **only on a fresh Mongo volume** (`docker compose down -v` to reset). `seed-technologies.js` inserts 33 sample technologies, idempotent; usage instructions are in its header (`docker cp` + `mongosh`).
- Tests: boilerplate only (`src/app.controller.spec.ts`, `test/app.e2e-spec.ts` = `GET /`). `npm test` (unit), `npm run test:e2e`.

## Frontend

- Angular 19, standalone components, `bootstrapApplication` — no NgModules.
- Structure: `core/` (auth, navigation) and `features/<domain>/` — `technology/` (viewer + administration), `user/` (user-management), `log/` (recent-logs). Each domain folder holds its `*.model.ts` + `*.service.ts` next to its components; API services use `environment.apiUrl` from `src/environments/` (angular.json `fileReplacements` swaps the dev file under `--configuration development`).
- **No test tooling:** karma/jasmine were removed, zero spec files — there is no `ng test`; don't look for specs. No lint script either.
- Styling: Tailwind v4 via `@tailwindcss/postcss` (global, `src/styles.css`). **Do not hand-write copies of Tailwind utilities in component CSS** — without media queries they override the real responsive rules (the comment in `viewer.component.css` documents the bug this caused).
- Build: `ng build` (production is the default configuration), `ng serve` (dev). `dist/` and `.angular/` are gitignored.

## PowerShell gotchas

- PowerShell swallows `$` in inline scripts — run mongosh/Node snippets from **files** (`docker cp x.js mongodb:/tmp/ && docker exec mongodb mongosh --file /tmp/x.js`), not via `--eval`.
- In the `mongo:8` image it's **mongosh**, not legacy mongo shell: cursors need `.toArray()` before `.map()`.
- Quote paths containing spaces.

## Docs

- `doc/db-schema.puml` — MongoDB schema (PlantUML). `README.md` — setup (bash-flavored; you're on PowerShell).
