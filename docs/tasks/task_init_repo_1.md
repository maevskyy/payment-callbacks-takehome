# Task 1 — Bootstrap project & cross-cutting layer

**Depends on:** —
**Goal:** Stand up a runnable NestJS skeleton with the database, config, and the
cross-cutting concerns every later module relies on.

## Scope

- Initialize a NestJS + TypeScript project (`npm`, strict TS).
- Add PostgreSQL via TypeORM; wire connection from `DATABASE_URL`.
- Add `docker-compose.yml` for app + Postgres; a single `docker-compose up`
  brings everything up.
- Config/env: `.env.example` with `PORT`, `DATABASE_URL`, `JWT_SECRET`,
  `JWT_EXPIRES_IN`.
- `common` module with:
  - correlation-id middleware (read `X-Correlation-Id` or generate one; attach to
    logs and echo in responses);
  - a global exception filter producing the structured error shape;
  - request-scoped tenant context that exposes the current `brandId`.
- `persistence` module shell: TypeORM entities for `users`, `sessions`,
  `raw_events`, `idempotency_keys` with the columns in ARCHITECTURE.md, plus a
  unique constraint on `(brandId, key)` in `idempotency_keys`.

## Acceptance criteria

- `docker-compose up` starts app + DB and the app connects successfully.
- A request without `X-Correlation-Id` gets one generated; it appears in logs and
  in the response.
- Any thrown error returns the structured JSON shape with a correct status code.
- The four tables are created via TypeORM (migration or synchronize).

## References

- Invariants → [../../AGENTS.md](../../AGENTS.md), [../../CLAUDE.md](../../CLAUDE.md)
- Data model → [../ARCHITECTURE.md](../ARCHITECTURE.md#data-model)
- Error format → [../API.md](../API.md#error-format)
- Decisions → [../DECISIONS.md](../DECISIONS.md) (ADR-1, ADR-2, ADR-7)

## Out of scope

- Auth logic, webhook logic, tests (later tasks).
