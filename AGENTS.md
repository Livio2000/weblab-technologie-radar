# AGENTS.md

Prototype SaaS "technology radar": NestJS 12 + MongoDB (`backend/`), Angular 22 (`frontend/`). Both on **TypeScript 6**. Dev machine is **Windows/PowerShell**. Owner is actively learning Angular — prefer small, reviewable changes with explanation over big rewrites. **Keep responses short** (user preference).

## Running the app

- **Backend (Docker, preferred):** `cd backend && docker compose up --build` → API on `:4000`, MongoDB on `:27017` (db `TechRadar`, user `admin` / `123456` — real values come from `docker-compose.override.yml`; the base compose file has them as empty placeholders). Mongo image is `mongo:9.0.4` (matches the CI service container); `docker compose down -v` resets the volume and re-runs the seed.
- **Frontend:** `cd frontend && npm install && ng serve` → `:4200`. Talks to the backend via CORS (`origin: '*'`); no dev proxy.
- **Backend without Docker:** `npm run start:dev` (needs MongoDB on `:27017`). Env-file selection is in `app.module.ts`: `NODE_ENV` unset → `.env`, set → `.env.${NODE_ENV}` (so local dev with the dev file needs `NODE_ENV=development`).

## Package managers

- **Frontend: npm** (`package-lock.json`).
- **Backend: use npm.** README + Dockerfile both use `npm install`. The `packageManager: yarn` field and `yarn.lock` are scaffolding leftovers — do not run yarn or regenerate `yarn.lock`. Note: `yarn.lock` keeps getting rewritten (2847-line diffs) after npm installs on this machine — if it shows modified in `git status`, revert it with `git checkout -- backend/yarn.lock`.

## Backend quirks

- All routes are URI-versioned: `/v1/...` (`enableVersioning` in `main.ts`).
- Auth is **manual JWT** (`jsonwebtoken`) with custom `AuthGuard`/`RolesGuard`. `passport*` and `@nestjs/swagger` are installed but **not wired in**.
- `ThrottlerModule` is configured in `app.module.ts` but no global throttler guard is applied — it is inert.
- **Env loading order matters:** `MongooseModule.forRoot(...)` reads `process.env` when the decorator arguments evaluate; `ConfigModule.forRoot(...)` earlier in the same `imports` array is what loads the `.env` file. Don't reorder/hoist these.
- In Docker, `NODE_ENV=Production` → looks for nonexistent `.env.Production`; the container relies on the compose env vars instead.
- `.env` / `.env.development` are **git-tracked** (not ignored).
- Seeding: `mongo-init.js` creates the admin user (`admin@example.com` / `Admin123!`) **only on a fresh Mongo volume** (`docker compose down -v` to reset).
- **Nest 12 packages are ESM-only**; the app still compiles to CommonJS and loads them via Node's `require(esm)` (needs Node ≥ 20.19/22.12 — OK here: local Node 26, container `node:23-alpine`). Consequences: no `import * as x` for CJS function-export packages (TS 6 emits `__importStar`, which wraps the function) — use default imports (`import compression from 'compression'`); `esModuleInterop` is on for that reason.
- Tests: boilerplate only (`src/app.controller.spec.ts`, `test/app.e2e-spec.ts` = `GET /`). `npm test` (unit), `npm run test:e2e`. The jest scripts must keep `node --experimental-vm-modules` (Jest needs it to `require()` the ESM-only Nest 12 packages). The e2e spec closes the app in `afterAll` — without it jest hangs on the open mongoose connection.

## Frontend

- Angular 22, standalone components, `bootstrapApplication` — no NgModules. **Zoneless + signals, migration complete**: no `zone.js` dependency, no `provideZoneChangeDetection`, no `ChangeDetectionStrategy` shims anywhere.
- Structure: `core/` (auth, navigation) and `features/<domain>/` — `technology/` (viewer + administration), `user/` (user-management), `log/` (recent-logs), `dashboard/` (gridster dashboard, 5 widgets incl. a Kendo Grid "Technologies" widget; **lazy route** — Kendo JS only loads on `/dashboard`). Each domain folder holds its `*.model.ts` + `*.service.ts` next to its components; API services use `environment.apiUrl` from `src/environments/` (angular.json `fileReplacements` swaps the dev file under `--configuration development`).
- **Frontend tests: Jest 30 + `jest-preset-angular`** (CJS preset, **zoneless** `setupZonelessTestEnv` in `setup-jest.ts`): `npm test` in `frontend/`; `npm run test:coverage` adds coverage (reporters + `coverageThreshold` in `jest.config.ts` — CI runs the coverage variant). Setup files: `jest.config.ts`, `jest-global-mocks.ts`, `tsconfig.spec.json` (`types: ["jest"]` — spec globals need no imports). No lint script.
  - **8 spec suites / ~31 tests.** HTTP service specs use `provideHttpClientTesting()` + `HttpTestingController` (pattern: `firstValueFrom` → `expectOne` → assert request → `flush` → assert response; `afterEach` `httpMock.verify()`). Guard specs run the real `routes` with a spied `AuthService`; component specs (`login`, `recent-logs`) drive the real template via `fixture`.
  - **Interceptor-spec gotcha (Angular ≥ 21):** `provideHttpClient()` is an *environment* provider whose `HttpBackend` defaults to the **fetch** backend and shadows a plain `provideHttpClientTesting()`. jsdom has no `fetch`, so requests silently die. Fix: `providers: [provideHttpClient(withInterceptors([fn])), makeEnvironmentProviders(provideHttpClientTesting())]` — testing provider wrapped and **last** so its `HttpBackend` wins.
- Styling: Tailwind v4 via `@tailwindcss/postcss` (global, `src/styles.css`). **Do not hand-write copies of Tailwind utilities in component CSS** — without media queries they override the real responsive rules (the comment in `viewer.component.css` documents the bug this caused).
- Build: `ng build` (production is the default configuration), `ng serve` (dev). `dist/` and `.angular/` are gitignored.

## Kendo UI (dashboard)

- `@progress/kendo-angular-grid@25.3.0` + `@progress/kendo-theme-default@14.9.0` + `@progress/kendo-licensing`. **Commercial** — prototype runs on the free trial: an evaluation banner shows until a license is activated (no functional impact).
- **License is file-based** (no key in code, nothing to gitignore): `npx kendo-ui-license refresh` (browser login) → key lands in `%AppData%\Telerik\telerik-license.txt` → `npx kendo-ui-license activate`.
- **Theme:** `@import "@progress/kendo-theme-default/dist/default-main.css";` in `styles.css` (v14 has no root `main.css`). Unlayered, so it beats Tailwind's layers — intended: theme styles the widgets, Tailwind lays out the tiles.
- **`provideAnimations()`** in `app.config.ts` (`@angular/platform-browser/animations`): Kendo components that use animations (e.g. the grid pager's ActionSheet injects `AnimationBuilder`) require it. Deprecated by Angular (removal planned v23) but still mandatory for Kendo v25.
- **`@angular/localize`:** Kendo calls the `$localize` global for default UI strings. Provided via `angular.json` `"polyfills": ["@angular/localize/init"]` — a direct `main.ts` import triggers a builder warning. Version must match `@angular/core` exactly.
- **Grid v25 gotchas:** cell template = `<ng-template kendoGridCellTemplate let-dataItem>` (not the old `*kendoCell`); automatic data processing (paging/sorting/filtering) needs `[kendoGridBinding]`, not `[data]` with a plain array; `pageable` only turns the pager UI on — **`pageSize` is required** for paging; `scrollable` defaults to `'scrollable'` (an inner scroll area needs a height; `'none'` = content-sized).
- **Gridster:** `angular-gridster2@22`. Layout persists to localStorage (`dashboard-layout`), merged over widget defaults; "Reset layout" clears it. Wrap interactive widget content in `class="gridster-item-content"` (the library's default `ignoreContentClass`) so mousedowns inside the widget don't start a tile drag.
- **Budgets** in `angular.json`: initial raised to 1.5MB warning / 2MB error (Kendo theme CSS is global, ~300 kB compressed). Kendo JS deferred by the lazy route (dashboard chunk ~3.7 MB raw / ~650 kB transfer; initial ~1.3 MB raw / ~200 kB transfer).

## CI

- `.github/workflows/ci.yml` — push to `main` + every PR; two parallel jobs, both on **Node 24** (Jest needs 24.9+ to `require(esm)` the ESM-only Nest 12 packages — Node 22 fails with ERR_REQUIRE_ESM).
- **backend:** `npm ci` → `npm run build` → `npm test` → `npm run test:e2e` against a `mongo:9.0.4` service (root user `admin`/`123456` via `MONGO_INITDB_ROOT_*`, auth'd mongosh health check). The workflow's `DATABASE_*` env vars win over `.env` (dotenv never overrides existing env vars).
- **frontend:** `npm ci` → `npm test` → `npm run build`. `ng` is **not global** on the runner — always `npm run build`.
- `mongo:8` refuses to start on current GitHub runner kernels (≥ 6.19, SERVER-121912) — hence `mongo:9.0.4` in CI **and** local compose.

## PowerShell gotchas

- PowerShell swallows `$` in inline scripts — run mongosh/Node snippets from **files** (`docker cp x.js mongodb:/tmp/ && docker exec mongodb mongosh --file /tmp/x.js`), not via `--eval`.
- In the `mongo:9` image it's **mongosh**, not legacy mongo shell: cursors need `.toArray()` before `.map()`.
- Quote paths containing spaces.

## Docs

- `doc/db-schema.puml` — MongoDB schema (PlantUML). `README.md` — setup (bash-flavored; you're on PowerShell).
