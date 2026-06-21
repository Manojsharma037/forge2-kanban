# Architecture

This document covers two layers:

1. **The application** — the Kanban API + UI (factual; this is what was built).
2. **The two-agent system** — OpenClaw + Hermes wired through Slack (the operating model;
   `[FILL IN]` markers indicate values specific to your own setup).

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

The qualifier requires a **two-agent**, human-supervised loop wired through Slack.

```
            ┌──────────────────────── Slack workspace ───────────────────────┐
            │                                                                 │
   Human ──►│  #forge-build                                                   │
  operator  │     │                                                           │
            │     ▼                                                           │
            │  ┌──────────────┐   tasks / plans   ┌──────────────────────┐    │
            │  │   HERMES     │ ────────────────► │      OPENCLAW        │    │
            │  │  "the brain" │                   │     "the hands"      │    │
            │  │  orchestrator│ ◄──────────────── │  coding agent        │    │
            │  │  + memory    │   results/diffs   │  writes & runs code  │    │
            │  │  + skills    │                   │                      │    │
            │  └──────────────┘                   └──────────────────────┘    │
            └─────────────────────────────────────────────────────────────────┘
                       │                                   │
                       ▼                                   ▼
                memory store                         this repo (backend/, frontend/)
            (decisions, context)                     + shell / git / artisan / npm
```

### Roles

| Agent | Role | Responsibilities |
| --- | --- | --- |
| **Hermes** | The brain (orchestrator) | Holds goals + memory, breaks work into tasks, selects and invokes **skills** (see `skills/`), supervises OpenClaw, posts status to Slack. |
| **OpenClaw** | The hands (coding agent) | Receives tasks via chat, writes/edits files, runs commands (`composer`, `artisan`, `npm`), reports diffs and results back. |

### Visibility & human-in-the-loop
- All exchanges happen in a Slack channel so a human can read, approve, or interrupt.
- Destructive/outward actions (migrations on prod, deploys) are surfaced for approval before running.
- The full transcript is captured in [`agent-log.md`](agent-log.md).

### Memory
- Hermes persists durable context — decisions made, conventions, current task list — so work
  survives across messages and sessions. `[FILL IN: where memory is stored — e.g. a JSON file,
  a vector store, the orchestrator's built-in memory]`.

### Free-model configuration `[FILL IN]`

Per the qualifier, **only free models** may be used (Ollama, Groq, Google Gemini, OpenRouter,
Cerebras, or Cloudflare Workers AI — **DeepSeek is prohibited**). Record your actual choices:

| Agent | Provider | Model | Notes |
| --- | --- | --- | --- |
| Hermes | `[FILL IN]` | `[FILL IN]` | orchestration / reasoning |
| OpenClaw | `[FILL IN]` | `[FILL IN]` | code generation |

API keys live in environment variables / Slack app config and are **never committed**.
