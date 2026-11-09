# Technologie-Radar

A prototype project for a SaaS-based technology management tool.

## Backend

NestJS 12 REST API backed by MongoDB (Mongoose), with manual JWT authentication. All routes are URI-versioned under `/v1` (e.g. `GET /v1/technologies`).

### 🚀 Setup

#### **1️⃣ Running Locally (Without Docker)**

1. Install dependencies:

   ```bash
   npm install
   ```

2. Make sure MongoDB is reachable on `localhost:27017` (or configure `DATABASE_URI`, `DATABASE_USER`, `DATABASE_PASS`, `DATABASE_NAME` in the env file).

3. Environment: configuration is loaded from a git-tracked env file — `.env` when `NODE_ENV` is unset, `.env.${NODE_ENV}` otherwise (e.g. `NODE_ENV=development` → `.env.development`). Other relevant variables: `PORT` (default `4000`) and `JWT_SECRET` (falls back to an insecure default when unset — set it in any real deployment).

4. Run the server:

   ```bash
   npm run start
   ```

   For hot-reloading during development:

   ```bash
   npm run start:dev
   ```

5. The server listens on port `4000` (or the port specified in your `PORT` environment variable).

---

#### **2️⃣ Running with Docker (Recommended)**
The backend is containerized using **Docker Compose**, which also includes a MongoDB database.

##### **Start the backend and MongoDB**
```bash
docker compose up --build
```

This will:
- **Build the NestJS backend** and start it in a container.
- **Start a MongoDB instance** in a separate container.
- **Expose the backend on port `4000`** and the database on port `27017`.
- **Create a default admin user** on a first start with a fresh database volume (re-run `docker compose down -v` to reset):
  Email: "admin@example.com" Password: "Admin123!"

##### **Stop the containers**
```bash
docker compose down
```

##### **Remove containers and volumes (fresh start)**
```bash
docker compose down -v
```

## Frontend

Angular 22 app (standalone components, zoneless, signals + reactive forms, Tailwind CSS v4). See `frontend/README.md` for details.

1. Start the backend first — development mode expects it at `http://localhost:4000`.
2. In the `frontend/` directory, install dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   ng serve
   ```
4. The Angular application runs on port `4200` by default and provides the user interface for the Technology Radar.

## Docs

- `doc/db-schema.puml` — MongoDB schema (PlantUML)
- `frontend/README.md` — frontend details
- `AGENTS.md` — notes for AI coding agents (repo quirks and gotchas)
