# Architecture

This document covers two layers:

1. **The application** — the Kanban API + UI (factual; this is what was built).
2. The agent-assisted workflow used during development and deployment.

---

## 1. Application Architecture

```
┌──────────────────────────┐         HTTP/JSON          ┌───────────────────────────┐
│   React + Vite SPA        │ ───────────────────────►   │   Laravel 11 REST API      │
│   (frontend/)             │ ◄───────────────────────   │   (backend/)               │
│                           │                            │                            │
│  App.jsx                  │   GET /api/boards/{id}      │  Routes: routes/api.php    │
│   ├─ Column.jsx           │   POST/PUT/DELETE …         │  Controllers: Api/*        │
│   ├─ CardItem.jsx         │                            │  Models: Eloquent          │
│   ├─ CardModal.jsx        │                            │                            │
│   └─ ManageModal.jsx      │                            │        │                   │
│  api.js (axios)           │                            │        ▼                   │
└──────────────────────────┘                            │   SQLite (database.sqlite) │
                                                         └───────────────────────────┘
```

### Data model

```
boards ──< lists ──< cards >── card_tag ──< tags
   │                   │                      │
   │                   └── assigned_member_id ┘ (→ members)
   └──< board_member >── members
```

| Table | Key columns | Relationships |
| --- | --- | --- |
| `boards` | name, description | hasMany lists; hasMany tags; belongsToMany members |
| `lists` | board_id, name, position | belongsTo board; hasMany cards (ordered by position) |
| `cards` | list_id, title, description, assigned_member_id, due_date, position | belongsTo list; belongsTo assignedMember; belongsToMany tags |
| `tags` | board_id, name, color | belongsTo board; belongsToMany cards |
| `members` | name, email | belongsToMany boards; hasMany assignedCards |
| `card_tag` | card_id, tag_id | pivot |
| `board_member` | board_id, member_id | pivot |

### Request flow (example: moving a card)

1. User drags a card to another column in the React UI.
2. `App.jsx` applies an **optimistic** local state update so the move is instant.
3. It issues `PUT /api/cards/{id}` with the new `list_id` and `position`.
4. `CardController@update` validates, persists, and returns the card with `tags` + `assignedMember`.
5. The UI reloads the board (`GET /api/boards/{id}`) to reconcile with the source of truth.

### Key design decisions

- **Eager loading** in `BoardController@show` (`lists.cards.tags`, `lists.cards.assignedMember`,
  `members`, `tags`) — one request hydrates the entire board, avoiding N+1 round-trips.
- **Tag syncing via `tag_ids`** — cards accept an array of tag IDs on create/update;
  `CardController` calls `$card->tags()->sync(...)`, keeping the many-to-many in one request.
- **Ordering by `position`** is enforced in the model relationships, so list/card order is stable.
- **Overdue flagging is a UI concern** (`utils.isOverdue`): a card is overdue when its
  `due_date` is before today *and* it is not in a list named "Done".
- **Validation returns `422` JSON** with field errors (browser-style 302 redirects are avoided
  because the client sends `Accept: application/json`).
- **CORS** allows the SPA origin (Laravel's default `HandleCors`, `allowed_origins: *` for `api/*`).

---

## 2. Two-Agent System

The qualifier requires a human-supervised agent workflow with planning, execution, visibility, and documented decision-making.

```
            ┌──────────────────────── Slack Workspace ───────────────────────┐
            │                                                                │
   Human ──►│  #forge-build                                                  │
  operator  │                                                                │
            │        Task Requests / Reviews / Feedback                      │
            │                                                                │
            │                    ┌──────────────────────┐                    │
            │                    │      OpenClaw        │                    │
            │                    │   (ForgeBot Agent)   │                    │
            │                    │                      │                    │
            │                    │ Architecture Review  │                    │
            │                    │ Repo Analysis        │                    │
            │                    │ Deployment Feedback  │                    │
            │                    └──────────────────────┘                    │
            │                                                                │
            └────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼

                           GitHub Repository + Deployments

                      Backend: Laravel API (Render)
                      Frontend: React/Vite (Vercel)
```

### Roles

| Agent               | Role                    | Responsibilities                                                                         |
| ------------------- | ----------------------- | ---------------------------------------------------------------------------------------- |
| Human Operator      | Supervisor              | Defines goals, reviews recommendations, approves implementation and deployment decisions |
| OpenClaw (ForgeBot) | Coding and review agent | Architecture planning, repository review, deployment validation, implementation feedback |

### Visibility & Human-in-the-Loop

* All agent interactions occurred inside Slack.
* Human review was required before applying significant implementation changes.
* Repository reviews, deployment reviews, and architecture planning were performed through Slack conversations.
* A complete record of interactions is stored in `agent-log.md`.

### Memory

Project decisions, implementation notes, deployment observations, and agent outputs were recorded through Slack conversations and preserved in `agent-log.md`.

The Slack conversation history served as the primary source of project context, design decisions, deployment notes, and implementation feedback throughout development.

Hermes was designed as the orchestration layer responsible for maintaining context, coordinating tasks, and supervising agent activities, while OpenClaw acted as the execution and coding layer. In this implementation, project context was maintained through documented Slack interactions and repository documentation. Based on common OpenClaw/Hermes workflows, Hermes typically serves as the planning and memory layer while OpenClaw performs implementation and execution tasks.

### Agent Configuration

| Agent               | Provider                    | Model                                      | Notes                                                                                        |
| ------------------- | --------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Hermes              | Planned orchestration layer | Not configured during final implementation | Task coordination, memory management, workflow supervision                                   |
| OpenClaw (ForgeBot) | Slack Workspace Agent       | Workspace-managed                          | Architecture planning, repository review, deployment validation, and implementation feedback |

API keys, deployment credentials, and environment secrets are managed through environment variables and deployment platforms and are never committed to source control.


### Agent Configuration

| Agent               | Provider              | Model             | Notes                                                                              |
| ------------------- | --------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| OpenClaw (ForgeBot) | Slack Workspace Agent | Workspace-managed | Architecture planning, repository review, deployment feedback, submission guidance |

### Security

* API keys and deployment secrets are stored through environment variables.
* No credentials are committed to source control.
* Backend configuration is managed through Laravel environment settings.
* Frontend configuration is managed through Vite environment variables.

### Human Oversight

The human operator retained final control over:

* Architecture decisions
* Repository changes
* Deployment actions
* Documentation updates
* Submission preparation

This ensured a fully supervised development workflow throughout the qualifier.

