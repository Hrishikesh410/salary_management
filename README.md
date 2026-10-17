# Incubyte Employee Salary Management — Monorepo Foundation

A high-performance TypeScript monorepo built for the Incubyte Employee Salary Management system, designed to handle compensation exploration, editing, and currency-isolated analytics across 10,000+ international employees.

---

## 1. Tech Stack Overview

- **Frontend (`apps/web`):** React 18, Vite, TypeScript, Vanilla CSS (rich custom design system tokens, responsive glassmorphic UI).
- **Backend (`apps/api`):** Node.js, Express, TypeScript, CORS, dotENV.
- **Data Layer:** PostgreSQL with Prisma ORM (`DECIMAL(12,2)` precision, indexed queries).
- **Package Manager:** npm (npm workspaces with root `package-lock.json`).
- **Testing & Quality:** Vitest, Supertest, Testing Library, TypeScript strict mode.

---

## 2. Monorepo Directory Structure

```text
salary_management/
├── apps/
│   ├── api/                     # Node.js Express API service
│   │   ├── prisma/
│   │   │   └── schema.prisma    # PostgreSQL Prisma schema with Employee model
│   │   ├── src/
│   │   │   ├── app.ts           # Express application & /api/health router
│   │   │   ├── server.ts        # HTTP listener with graceful shutdown
│   │   │   └── tests/           # Integration tests (Supertest + Vitest)
│   │   ├── .env.example         # API environment template
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                     # React + Vite client
│       ├── src/
│       │   ├── App.tsx          # Foundation dashboard & health monitor
│       │   ├── App.test.tsx     # Vitest UI tests
│       │   ├── index.css        # Rich dark-mode design system
│       │   └── main.tsx         # React root
│       ├── .env.example         # Web environment template
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts       # Vite configuration with /api proxy
├── docs/
│   ├── requirements.md          # Product Requirements Document (PRD)
│   └── architecture.md          # Architectural decisions & request flow
├── .env.example                 # Root environment template
├── .gitignore                   # Monorepo git ignore rules
├── package.json                 # Root npm workspaces configuration
└── package-lock.json            # Deterministic lockfile
```

---

## 3. Prerequisites

- **Node.js:** `>= 20.x` (Tested on `v24.13.0`)
- **npm:** `>= 10.x` (Tested on `11.6.2`)
- **PostgreSQL:** `>= 14` (Local installation or Docker container)

---

## 4. Quick Start & Setup

### 1. Clone & Install Dependencies
From the repository root:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` templates:
```bash
# Root / backend env
cp apps/api/.env.example apps/api/.env

# Frontend env
cp apps/web/.env.example apps/web/.env
```
*(On Windows PowerShell, use `Copy-Item apps/api/.env.example apps/api/.env`)*

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Database Migration (When PostgreSQL is running)
```bash
npm --workspace=@incubyte/api run db:migrate
```

### 5. Start Development Servers
To start both frontend and backend concurrently:
```bash
npm run dev
```
Or start individually:
- **Backend API:** `npm run dev:api` (Runs on `http://localhost:4000`)
- **Frontend Web:** `npm run dev:web` (Runs on `http://localhost:5173`)

---

## 5. Available Scripts

The root `package.json` orchestrates workspace scripts:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both API and Web dev servers concurrently |
| `npm run dev:api` | Starts Express backend in watch mode using `tsx` |
| `npm run dev:web` | Starts Vite React client with HMR |
| `npm run build` | Builds both API (`dist`) and Web (`dist`) bundles |
| `npm run typecheck`| Runs TypeScript compiler (`tsc --noEmit`) across all apps |
| `npm run test` | Runs automated test suites across API and Web with Vitest |
| `npm run lint` | Runs workspace linter checks |
| `npm run db:generate` | Generates Prisma client types from `schema.prisma` |

---

## 6. Health Check Endpoint

The API exposes a health check endpoint to verify uptime and operational status:
- **URL:** `GET http://localhost:4000/api/health`
- **Sample Response:**
```json
{
  "status": "ok",
  "service": "incubyte-salary-management-api",
  "uptime": 45.2,
  "timestamp": "2026-10-17T11:20:00.000Z"
}
```

---

## 7. Documentation References

- **[Product Requirements Document (PRD)](file:///d:/Personal%20Projects/salary_management/docs/requirements.md):** Target user personas, acceptance criteria, 10k dataset scale, and functional scope.
- **[Architecture Document](file:///d:/Personal%20Projects/salary_management/docs/architecture.md):** Request flow, module boundaries, database choice, precision handling, and architectural trade-offs.
