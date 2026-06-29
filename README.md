# PMGT — Project Management Tool

A self-hosted project management tool inspired by JIRA. Track projects, manage issues on a Kanban board, plan sprints, and collaborate with your team.

## Features

- **Project Management** — Create and manage multiple projects with unique keys
- **Kanban Board** — Drag-and-drop issues between To Do, In Progress, and Done columns
- **Issue Tracking** — Full issue lifecycle with types (Story, Task, Bug, Epic), priorities, and statuses
- **Sprint Management** — Plan, start, and complete sprints with goals and date ranges
- **Team Collaboration** — Add team members to projects with role-based permissions
- **Comments** — Discuss issues with threaded comments
- **User Management** — Admin panel for user CRUD with role assignments
- **Mobile Responsive** — Works on desktop and mobile devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Backend | Express.js, Prisma ORM |
| Database | SQLite (dev), PostgreSQL-compatible schema |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Drag & Drop | @dnd-kit |
| Styling | Custom CSS (no framework dependency) |

## Quick Start

### Prerequisites

- **Node.js 20+** and **npm**
- Or **Docker** and **Docker Compose** for containerized deployment

### Option 1: One-Command Deploy

```bash
./deploy.sh docker
```

Then visit **http://localhost:8080** and log in with:
- Email: `admin@example.com`
- Password: `password123`

### Option 2: Local Development

```bash
# Set up everything
./deploy.sh dev

# Or manually:
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev          # → http://localhost:5000

# In another terminal:
cd frontend
cp .env.example .env
npm install
npm run dev          # → http://localhost:5173
```

### Option 3: Docker Compose

```bash
# Set your secrets
export JWT_SECRET=$(openssl rand -hex 32)

# Build and start
docker compose up -d --build

# Run database migrations (first time)
docker compose exec backend npx prisma migrate deploy

# Seed sample data (optional)
docker compose exec backend npm run seed

# Visit http://localhost:8080
```

### Option 4: Production (Traditional)

```bash
./deploy.sh prod
```

This builds the frontend to `frontend/dist/` and starts the backend with PM2 (if installed) or as a background process. Serve the `dist/` directory with nginx or any static file server.

## Default Users

After seeding, these accounts are available (all passwords: `password123`):

| Email | Role |
|-------|------|
| admin@example.com | Admin |
| alice@example.com | Project Manager |
| bob@example.com | Developer |
| carol@example.com | Developer |
| dave@example.com | Viewer |

**⚠️ Change the admin password immediately after first login.**

## Configuration

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite path or PostgreSQL URL |
| `JWT_SECRET` | (required) | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | `production` for production |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API URL |

## Using PostgreSQL

The Prisma schema uses SQLite by default (zero-config). To switch to PostgreSQL:

1. Update `backend/prisma/schema.prisma` — change `provider = "sqlite"` to `provider = "postgresql"`
2. Update `backend/.env` — set `DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public`
3. Run `npx prisma migrate dev` to create PostgreSQL tables

## API Overview

```
POST   /api/auth/register          # Register (admin only in UI)
POST   /api/auth/login             # Login
GET    /api/auth/me                # Current user

GET    /api/users                  # List users
POST   /api/users                  # Create user (admin)
PUT    /api/users/:id              # Update user
DELETE /api/users/:id              # Delete user (admin)

GET    /api/projects               # My projects
POST   /api/projects               # Create project
GET    /api/projects/:id           # Project details
PUT    /api/projects/:id           # Update project
DELETE /api/projects/:id           # Delete project

GET    /api/issues/project/:id     # Issues by project
POST   /api/issues/project/:id     # Create issue
GET    /api/issues/:id             # Issue details
PUT    /api/issues/:id             # Update issue
DELETE /api/issues/:id             # Delete issue
POST   /api/issues/:id/comments    # Add comment

GET    /api/sprints/project/:id    # Sprints by project
POST   /api/sprints/project/:id    # Create sprint
PUT    /api/sprints/:id            # Update sprint
DELETE /api/sprints/:id            # Delete sprint
POST   /api/sprints/:id/start      # Start sprint
POST   /api/sprints/:id/complete   # Complete sprint

GET    /health                     # Health check
```

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access — manage users, all projects, system settings |
| **Project Manager** | Create/manage projects, manage members, all issue operations |
| **Developer** | Create/edit issues, comment, participate in assigned projects |
| **Viewer** | Read-only access to assigned projects |

## Project Structure

```
pmgt/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # Prisma client
│   │   ├── controllers/          # Route handlers
│   │   ├── middleware/           # Auth, error handling
│   │   ├── routes/               # Express routes
│   │   ├── utils/                # Auth utils, seed script
│   │   └── server.js             # App entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── contexts/             # React contexts (auth)
│   │   ├── pages/                # Page components
│   │   ├── services/             # API client
│   │   └── types/                # TypeScript types
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── deploy.sh
└── README.md
```

## License

MIT
