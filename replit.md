# Workspace

## Overview

FixMyCity - A full-stack Civic Issue Reporter app built with React + Vite frontend, Express backend, and PostgreSQL database.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + React Query
- **Build**: esbuild (CJS bundle)

## Features

- **Landing Page** — Hero section with live stats (total reports, resolved, in-progress)
- **Report Issue** — Form to submit civic issues (saves to DB, increments report count)
- **Community Feed** — Public feed of all issues with filters. "Report Same Issue" button increments count.
- **Leaderboard** — Users ranked by report count with points system
- **Admin Login** — Protected admin panel (admin/admin123)
- **Admin Dashboard** — View all issues, update status (reported/in-progress/resolved), add notes

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── civic-issue/        # React + Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

### `issues` table

| Column | Type | Notes |
|--------|------|-------|
| id | serial PK | Auto-increment |
| title | text | Issue title |
| category | text | e.g. Road & Infrastructure |
| description | text | Detailed description |
| digi_pin | text | DIGIPIN location code |
| location | text | Human-readable location |
| reporter_name | text | Reporter's name |
| reporter_email | text | Reporter's email |
| reporter_contact | text | Phone number |
| status | enum | reported / in-progress / resolved |
| report_count | int | Increments on upvote/duplicate |
| admin_notes | text | Admin resolution notes |
| submitted_at | timestamp | Auto-set on create |
| resolved_at | timestamp | Set when status = resolved |

## API Routes

- `GET /api/issues` — Community feed (filterable by status/category)
- `POST /api/issues` — Submit new issue (or upvotes duplicate digipin+category)
- `GET /api/issues/:id` — Single issue details
- `POST /api/issues/:id/upvote` — Increment report count
- `PATCH /api/issues/:id/status` — Admin: update status + notes
- `GET /api/leaderboard` — Ranked users by report count
- `GET /api/stats` — Aggregate stats for homepage
- `POST /api/admin/login` — Admin login (admin/admin123)
- `GET /api/admin/issues` — Admin: all issues with filters
- `GET /api/healthz` — Health check

## Admin Credentials

- Username: `admin`
- Password: `admin123`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. All routes in `src/routes/issues.ts`.

### `artifacts/civic-issue` (`@workspace/civic-issue`)

React + Vite frontend with pages: Landing, Report, Community, Leaderboard, AdminLogin, AdminDashboard.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM. Schema in `src/schema/issues.ts`.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

Push schema: `pnpm --filter @workspace/db run push`
