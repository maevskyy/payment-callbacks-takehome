# Design Decisions (ADR)

Each record captures the **context**, the **decision**, and its **consequences**
(including trade-offs). For the system overview see
[ARCHITECTURE.md](./ARCHITECTURE.md).

---

## ADR-1: NestJS + TypeScript

**Context.** The assignment asks for a small service with clear module
boundaries and testability.

**Decision.** Use NestJS with TypeScript.

**Consequences.** Built-in module system, DI, guards, and exception filters map
directly onto the required boundaries (identity / callbacks / persistence) and
the structured-error requirement. Trade-off: more boilerplate than a minimal
Express app, but it pays off in structure and built-in testing support.

---

## ADR-2: PostgreSQL + TypeORM

**Context.** Need a relational store for `users`, `sessions`, `raw_events`,
`idempotency_keys`, with a unique constraint to support idempotency.

**Decision.** PostgreSQL accessed via TypeORM.

**Consequences.** TypeORM integrates natively with NestJS (modules, repositories,
decorators) and a unique index on the idempotency key gives DB-level dedup
guarantees. Trade-off: TypeORM's abstractions can hide query cost; we keep all DB
access inside the `persistence` layer to contain that.

---

## ADR-3: JWT authentication with a `sessions` table

**Context.** Need login plus a protected `GET /profile/me`. The data model
includes a `sessions` table.

**Decision.** Issue JWTs on login; persist issued sessions in `sessions` so
tokens can be tracked and revoked.

**Consequences.** Stateless verification on each request, but the `sessions`
table allows revocation and an audit trail. Trade-off: a DB lookup on protected
routes if we check revocation, versus pure-stateless JWT; acceptable for this
scope.

---

## ADR-4: Idempotency via a dedicated `idempotency_keys` table

**Context.** Payment providers retry webhooks, so the same event can arrive
multiple times. It must be processed at most once.

**Decision.** Derive an idempotency key per callback (provider + event id, or an
`Idempotency-Key` header) and record it in `idempotency_keys`, scoped by
`brandId`, with a unique constraint. A repeat is a safe no-op returning `200`.

**Consequences.** Duplicates are deduplicated reliably even under concurrency
(the unique constraint is the source of truth). Trade-off: the key-derivation
strategy depends on the provider payload shape; this is documented as an open
question to confirm against real provider contracts.

---

## ADR-5: Store raw events; no balance mutation in adapters (outbox-like)

**Context.** The service must be ready for a future ledger but must not move
money now.

**Decision.** Webhook handlers persist the verbatim payload into `raw_events`
and stop there. No balance updates or business side effects in the intake path.

**Consequences.** The intake path is simple, safe, and replayable; a later ledger
process consumes `raw_events` independently. Trade-off: processing is deferred,
so `raw_events` needs an eventual consumer (out of scope here).

---

## ADR-6: Tenant isolation by `brandId` in the persistence layer

**Context.** Multiple brands share the service; their data must stay separate.

**Decision.** Carry `brandId` in a request-scoped tenant context and apply it as
a filter on every query inside `persistence`.

**Consequences.** A single enforced choke point prevents cross-tenant leakage,
and it is verifiable with a tenant-leakage test. Trade-off: every repository
method must thread `brandId`; centralizing DB access in `persistence` keeps this
consistent.

---

## ADR-7: Observability via correlation ids

**Context.** Callback handling must be traceable.

**Decision.** Assign a correlation/request id in middleware and attach it to all
logs for the request.

**Consequences.** Any callback can be traced end to end from the logs with low
overhead. Trade-off: full distributed tracing is out of scope; correlation ids
are the pragmatic MVP.
