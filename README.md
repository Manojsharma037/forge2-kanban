# Forge Kanban — Two-Agent Build

A tiny Trello-style Kanban board (**Boards → Lists → Cards**) built collaboratively by a
two-agent system for the **Forge 2 Edition 1 Qualifier** (June 21, 2026).

- **Backend:** Laravel 11 (PHP 8.2+) REST API, SQLite
- **Frontend:** React 19 + Vite
- **Agents:** OpenClaw (*the hands* — coding agent) + Hermes (*the brain* — orchestrator with
  memory and skills), wired through Slack for visible, human-supervised operation.

> See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the system design, **[agent-log.md](agent-log.md)**
> for the unedited agent/Slack exchanges, and **[skills/](skills/)** for the reusable skill.

---

## Features

| Requirement | Status |
| --- | --- |
| Boards → Lists → Cards hierarchy | ✅ |
| Create a board (auto-seeds To-Do / Doing / Done) | ✅ |
| Card title, description, inline editing | ✅ |
| Move a card between lists (drag-and-drop) | ✅ |
| Colored tags / labels | ✅ |
| Member assignment | ✅ |
| Due date with visual overdue flagging | ✅ |
| **Bonus:** drag-and-drop | ✅ |
| **Bonus:** email alerts, comments | ⬜ not yet |

---

## Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| API | Laravel 11, PHP 8.2 | Batteries-included REST, Eloquent ORM, free to run |
| DB | SQLite | Zero-config, file-based — free tier friendly |
| UI | React 19 + Vite | Fast HMR, small footprint |
| HTTP | Axios | Simple promise-based client |
| Models (agents) | Free only — see ARCHITECTURE.md | Qualifier rule: no paid APIs |

---

## Local Setup

### Prerequisites
- PHP 8.4+ with the SQLite extension (a dependency in `composer.lock` requires `>=8.4.1`)
- Composer
- Node.js 18+

### 1. Backend (Laravel API)

```bash
cd backend
composer install
cp .env.example .env        # if .env does not already exist
php artisan key:generate

# SQLite database file (already committed as an empty file; create if missing)
# Windows PowerShell: New-Item -ItemType File database/database.sqlite
touch database/database.sqlite

php artisan migrate:fresh --seed   # creates schema + demo board
php artisan serve                  # http://127.0.0.1:8000
```

The seeder creates **"Product Roadmap"** (board #1) with three lists, three members,
four colored tags, and demo cards — including one deliberately overdue card so the
overdue flag is visible immediately.

### 2. Frontend (React UI)

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

The UI talks to `http://127.0.0.1:8000/api` by default. For a deployed API, set:

```bash
# frontend/.env
VITE_API_URL=https://your-api-host/api
```

---

## API Reference

Base URL: `/api`

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/boards` | All boards |
| POST | `/boards` | `{ name, description? }` |
| GET | `/boards/{id}` | Board with nested lists → cards (tags + assignee), members, tags |
| PUT | `/boards/{id}` | Update name/description |
| DELETE | `/boards/{id}` | Cascades to lists/cards |
| GET/POST/PUT/DELETE | `/lists` | `{ board_id, name, position }` |
| GET/POST/PUT/DELETE | `/cards` | `{ list_id, title, description?, assigned_member_id?, due_date?, position?, tag_ids?[] }` — **move a card** = `PUT` with a new `list_id` |
| GET/POST/PUT/DELETE | `/tags` | `?board_id=` filter; `{ board_id, name, color }` |
| GET/POST/PUT/DELETE | `/members` | `?board_id=` filter; `{ name, email, board_id? }` |

All write endpoints validate input and return `422` with field errors on failure.

---

## Deployment (free stack: Render + Vercel)

Deploy the **API first** (you need its URL for the frontend), then the **frontend**.

### Step 1 — API on Render (Docker, free tier)

The backend ships a `Dockerfile`, `docker-entrypoint.sh`, and a root `render.yaml` Blueprint,
so Render needs no manual build config.

**Option A — Blueprint (one click):**
1. Push this repo to GitHub.
2. Render dashboard → **New + → Blueprint** → select the repo. Render reads `render.yaml`
   and creates the `forge-kanban-api` web service.
3. Generate an app key locally and paste it into the service's `APP_KEY` env var:
   ```bash
   cd backend && php artisan key:generate --show   # copy the base64:... value
   ```
   (If you skip this, the container generates one on each boot — fine for a demo.)
4. **Create Web Service.** First build takes a few minutes.

**Option B — manual web service:** New + → **Web Service** → repo → Runtime **Docker**,
Dockerfile path `backend/Dockerfile`, Docker context `backend`, plan **Free**. Add the same
env vars listed in `render.yaml`.

Your API will be at `https://forge-kanban-api.onrender.com` (your name may differ).
Verify: open `https://<your-service>.onrender.com/api/boards` — you should see JSON.

> **Free-tier notes:** the service sleeps after ~15 min idle (first request then takes
> ~30–60s to wake), and the filesystem is ephemeral — so the SQLite DB is **rebuilt and
> reseeded on every restart**. That keeps the demo board present; it is not for durable data.
> For persistence, swap to Render's free Postgres and set the `DB_*` env vars accordingly.

### Step 2 — Frontend on Vercel

Vite inlines `VITE_API_URL` **at build time**, so set it *before* deploying.

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** `frontend` (Framework Preset auto-detects **Vite**).
   - Build Command: `npm run build` · Output Directory: `dist`
3. **Environment Variables** → add:
   ```
   VITE_API_URL = https://<your-service>.onrender.com/api
   ```
   (Note the `/api` suffix — it matches the API's route prefix.)
4. **Deploy.** Your board is live at the Vercel URL.

> If you change `VITE_API_URL` later, trigger a **redeploy** — the value is baked in at build time.

### CORS
The API allows all origins for `api/*` (Laravel's default `HandleCors`), so the Vercel
frontend can call Render out of the box. To lock it down, publish `config/cors.php` and set
`allowed_origins` to your Vercel domain.

### Secrets
`.env`, API keys, and Slack tokens are **not** committed (see `backend/.gitignore`). Set them
as environment variables in the Render/Vercel dashboards.

---

## Repository Layout

```
.
├── backend/          Laravel API (models, controllers, migrations, seeder)
├── frontend/         React + Vite SPA
├── skills/           Reusable skill(s) used by the orchestrator (SKILL.md)
├── ARCHITECTURE.md   System + agent design
├── agent-log.md      Unedited human ↔ agent chat exchanges
└── README.md         You are here
```
