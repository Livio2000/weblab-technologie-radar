# Technologie-Radar

A prototype project for a SaaS-based technology management tool.

## Backend

This is a NestJS backend.

### 🚀 Setup

#### **1️⃣ Running Locally (Without Docker)**

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the server:

   ```bash
   npm run start
   ```

3. The server listens on port `4000` (or the port specified in your `PORT` environment variable).

For hot-reloading during development:

   ```bash
   npm run start:dev
   ```

---

#### **2️⃣ Running with Docker (Recommended)**
The backend is containerized using **Docker Compose**, which also includes a MongoDB database.

##### **Start the backend and MongoDB**
```bash
docker-compose up --build
```

This will:
- **Build the NestJS backend** and start it in a container.
- **Start a MongoDB instance** in a separate container.
- **Expose the backend on port `4000`** and the database on port `27017`.

##### **Stop the containers**
```bash
docker-compose down
```

##### **Remove containers and volumes (fresh start)**
```bash
docker-compose down -v
```

## Frontend

This is an Angular application.

### 🚀 Setup

#### **Running Locally**

1. In the Angular project directory, install dependencies:
   ```bash
   npm install
   ```

2. Start the Angular development server:
   ```bash
   ng serve
   ```

3. The Angular application runs on port `4200` by default and provides the user interface for the Technology Radar.