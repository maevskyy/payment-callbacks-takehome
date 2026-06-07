# Payment Callbacks Service

A small NestJS backend demonstrating identity basics, safe PSP/GSP webhook
handling, and readiness for a future ledger integration.

For the high-level overview and the rules the code must follow, start with
[CLAUDE.md](./CLAUDE.md).

## Documentation

| Document | What's inside |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | Project overview, hard invariants, project map |
| [docs/GLOSSARY.md](./docs/GLOSSARY.md) | Domain terms in plain language (PSP, idempotency, tenant…) |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Module boundaries, data model, webhook lifecycle |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Design decisions and trade-offs (ADR format) |
| [docs/API.md](./docs/API.md) | Endpoints with request/response examples |
| [docs/tasks/](./docs/tasks/) | Step-by-step implementation tasks |
| [TASK.md](./TASK.md) | Original assignment |

## Stack

- NestJS + TypeScript
- PostgreSQL via TypeORM
- JWT authentication

## Requirements

- Node.js 20+
- Docker + Docker Compose (for the database)

## Setup & run

> The application code is not implemented yet — the commands below describe the
> intended local run flow (a single command to bring everything up).

```bash
# 1. Install dependencies
npm install

# 2. Copy environment defaults
cp .env.example .env

# 3. Bring up app + database
docker-compose up --build
```

The API will be available at `http://localhost:3000`.

## Tests

```bash
npm test          # unit tests
npm run test:e2e  # integration tests (idempotency, tenant isolation)
```

Planned test coverage:
- a unit test for callback use-case logic;
- an integration test for callback idempotency (duplicate is deduplicated);
- a tenant-leakage test (Brand A cannot access Brand B data).

## Environment variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | HTTP port | `3000` |
| `DATABASE_URL` | Postgres connection string | `postgres://user:pass@db:5432/app` |
| `JWT_SECRET` | Secret for signing JWTs | `change-me` |
| `JWT_EXPIRES_IN` | Token lifetime | `1h` |
