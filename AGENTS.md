# Agent Guide

Single entry point for coding agents (Codex, Claude, Cursor, …) working in this
repository. Keep this file short: the detailed source of truth lives in the
shared docs linked below. `CLAUDE.md` is a thin pointer to this file so there is
no second copy to drift.

## Start Here

1. Read [TASK.md](./TASK.md) for the assignment goal and acceptance criteria.
2. Read [README.md](./README.md) for setup, run, and test commands.
3. Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) before changing module
   boundaries, data flow, persistence, or tenant handling.
4. Read [docs/API.md](./docs/API.md) before changing request/response shapes.
5. Read [docs/DECISIONS.md](./docs/DECISIONS.md) before changing design trade-offs.

## Non-Negotiables

These are enforced project rules, not suggestions:

- **Tenant isolation** — every storage query for tenant-owned data is filtered by
  `brandId`. Brand A must never read or write Brand B's data.
- **No balance mutation in adapters** — PSP/GSP webhook adapters only persist raw
  events and idempotency keys. They never update balances or trigger
  ledger/business side effects.
- **Idempotency** — duplicate callbacks are safe no-ops, deduplicated by
  tenant-scoped idempotency keys.
- **Structured errors** — responses use the shape in
  [docs/API.md](./docs/API.md#error-format) with clear HTTP status codes.
- **Correlation id** — every request carries a correlation/request id for tracing.

## Project Map

| Path | Responsibility |
|---|---|
| `src/identity` | Register, login, profile, JWT/session validation. |
| `src/callbacks` | PSP/GSP webhook intake, validation, idempotency, raw event persistence. |
| `src/persistence` | TypeORM entities and persistence module wiring. |
| `src/common` | Correlation id, structured errors, tenant context. |
| `test/` | E2E coverage for idempotency, tenant isolation, webhook contract, Swagger UI. |

## Commands

```bash
pnpm install
pnpm build
pnpm test
pnpm test:e2e
docker compose up --build
```

If port `3000` is busy:

```bash
PORT=3001 docker compose up --build
```

## Useful Links

- Domain glossary: [docs/GLOSSARY.md](./docs/GLOSSARY.md)
- Architecture & data model: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- API examples & error shape: [docs/API.md](./docs/API.md)
- Design decisions & trade-offs: [docs/DECISIONS.md](./docs/DECISIONS.md)
- Implementation tasks: [docs/tasks/](./docs/tasks/)

## Working Notes

- Prefer small, task-scoped commits that map to [docs/tasks/](./docs/tasks/).
- Do not introduce balance, wallet, or ledger mutation into webhook intake.
- Keep docs and implementation aligned when changing module responsibilities or
  security trade-offs.
