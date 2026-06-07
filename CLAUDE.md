# Payment Callbacks Service

A small **NestJS + TypeScript** backend that demonstrates three things:
1. **Identity basics** — register, login, fetch own profile.
2. **Safe PSP/GSP callback handling** — payment-provider webhooks are persisted
   idempotently and per-tenant, with no side effects on balances.
3. **Readiness for a future ledger** — callbacks only store the *raw* event; the
   ledger that actually moves money is a separate, later concern.

> This file is the entry point for any AI assistant or reviewer. It is kept short
> and high-signal. Follow the cross-links for detail.

---

## Hard invariants (never violate)

These are enforced rules, not suggestions. Any code change must respect them.

- **Tenant isolation** — every storage query is filtered by `brandId`. Brand A
  must never be able to read or write Brand B's data.
- **No balance mutation in adapters** — webhook handlers (PSP/GSP) only write to
  `raw_events`. They never update balances or trigger business side effects.
- **Idempotency** — a callback that repeats with the same idempotency key is
  safely ignored/deduplicated. It is stored at most once.
- **Structured errors** — every error response has a clear HTTP status code and a
  consistent JSON shape. See [docs/API.md](./docs/API.md#error-format).
- **Correlation id** — every request carries a correlation/request id that is
  attached to all of its logs.

---

## Project map

| Path | Responsibility |
|---|---|
| `src/identity` | Auth (register, login) + profile. JWT, `sessions` table. |
| `src/callbacks` | PSP/GSP webhook intake. Validates tenant, dedupes, stores raw event. |
| `src/persistence` | TypeORM entities + repositories. The only layer that touches the DB. |
| `src/common` | Cross-cutting: correlation-id middleware, error filter, tenant context. |

> The codebase is not generated yet — this map describes the intended layout that
> the documentation is written against.

---

## Stack

- NestJS + TypeScript
- PostgreSQL via TypeORM
- JWT for authentication (issued tokens tracked in the `sessions` table)

---

## Where to look next

- **Architecture, data model, webhook lifecycle** → [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Design decisions & trade-offs (ADR)** → [docs/DECISIONS.md](./docs/DECISIONS.md)
- **Endpoints with request/response examples** → [docs/API.md](./docs/API.md)
- **Implementation tasks (step by step)** → [docs/tasks/](./docs/tasks/)
- **Setup & run instructions** → [README.md](./README.md)
- **Original assignment** → [TASK.md](./TASK.md)
