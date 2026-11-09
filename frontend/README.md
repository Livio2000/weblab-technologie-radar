# Frontend

Web UI for the Technologie-Radar prototype.

Stack: [Angular 22](https://angular.dev) (standalone components), **zoneless** — no `zone.js` — with state driven by **signals** and **reactive forms**, styling via **Tailwind CSS v4**. Package manager: **npm**.

## Prerequisites

- Node.js 22.22.3+, 24.15.0+, or 26+
- The backend running (see the root README) — development mode expects it at `http://localhost:4000`

## Development server

To start a local development server, run:

```bash
npm install
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

The dev server defaults to the `development` configuration, which swaps in `src/environments/environment.development.ts`, pointing the API at `http://localhost:4000/v1`. There is no dev proxy — the backend handles CORS.

## Building

To build the project run:

```bash
ng build
```

This compiles the project and stores the build artifacts in the `dist/frontend/` directory. The production configuration (the default) optimizes for performance and uses `src/environments/environment.ts`, whose `apiUrl` is the same-origin `/v1` — so a production deploy expects the app to be served from the same host as the API (e.g. behind a reverse proxy).

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Tests & lint

No test tooling is configured (Karma/Jasmine were removed) and there is no lint script — `ng test` and `ng lint` are intentionally not available.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
