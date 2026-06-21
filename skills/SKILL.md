---
name: kanban-feature
description: >
  Add a full-stack feature to the Forge Kanban app (Laravel API + React/Vite UI) following the
  project's established conventions. Use when adding or extending a resource — e.g. a new field
  on cards, a new entity (comments, checklists), or new behavior on an existing endpoint.
---

# Skill: kanban-feature

A reusable recipe for shipping a vertical slice through this codebase the way the rest of it is
built. Following it keeps new work consistent with the existing models, controllers, and UI.

## When to use
- Adding a field to an existing resource (e.g. `cards.priority`).
- Adding a new resource end-to-end (e.g. `comments` on a card).
- Adding behavior to an endpoint (e.g. archiving a list).

## Project conventions (read first)
- **API base:** `backend/`, Laravel 11, routes in `routes/api.php` as `Route::apiResource(...)`.
- **Controllers:** `app/Http/Controllers/Api/*Controller.php`. Every write action **validates**
  input with `$request->validate([...])` and returns the model with its relations loaded.
- **Models:** `app/Models/*`. Relationships declared explicitly; ordered collections use
  `->orderBy('position')` in the relationship.
- **Many-to-many** is synced via an `*_ids` array on the parent's store/update
  (see `CardController` + `tag_ids`), not via separate attach/detach endpoints.
- **Board fetch** (`BoardController@show`) eager-loads everything the UI needs in one request.
- **DB:** SQLite. Schema changes are migrations in `database/migrations/`; demo data in
  `database/seeders/DatabaseSeeder.php`.
- **Frontend:** `frontend/src/`. `App.jsx` owns board state and reloads the board after each
  mutation; presentational pieces live in `components/`; shared helpers in `utils.js`;
  HTTP via `api.js` (axios, `VITE_API_URL`-aware).

## Steps

### 1. Schema (if data changes)
1. `cd backend && php artisan make:migration <name>`.
2. Add columns / table; use `foreignId(...)->constrained()->onDelete('cascade')` for relations.
3. Update the relevant model's `$fillable` and relationships.
4. Add representative rows to `DatabaseSeeder` so the feature is visible after seeding.
5. `php artisan migrate:fresh --seed`.

### 2. API
1. Add/extend the controller in `app/Http/Controllers/Api/`. Validate every input.
2. For partial updates use `sometimes` rules; for create use `required`.
3. Return the model with relations: `return $model->load([...]);`.
4. If it's a new resource, register `Route::apiResource('<plural>', <Controller>::class);`.
5. If the resource is board-scoped, support `?board_id=` filtering in `index`.

### 3. Wire into the board response (if the UI needs it on load)
- Add the relation to `BoardController@show`'s `with([...])` so one fetch hydrates it.

### 4. Frontend
1. Add API calls in `App.jsx` (or a focused handler), then `await loadBoard()` to reconcile.
2. Add/extend a component in `components/`; keep presentation there, state in `App.jsx`.
3. Put pure helpers (formatting, derived flags) in `utils.js`.
4. For mutations that should feel instant (drag/move), update local state optimistically,
   then PUT, then reload.

### 5. Verify (do not skip)
- API: `curl` the new path with `-H "Accept: application/json"`; confirm a happy path **and**
  a `422` on invalid input.
- If cross-origin matters, confirm the CORS preflight: `OPTIONS` → `204` with
  `Access-Control-Allow-*` headers.
- Frontend: `npm run build` must pass with no errors before declaring done.

## Definition of done
- [ ] Migration + model + seeder updated (if data changed) and `migrate:fresh --seed` runs clean.
- [ ] Controller validates input and returns loaded relations.
- [ ] Route registered; board response hydrates the relation if the UI needs it on load.
- [ ] UI reads/writes through `api.js` and reloads the board after mutations.
- [ ] `curl` happy-path + `422` verified; `npm run build` passes.
