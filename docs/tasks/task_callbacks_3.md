# Task 3 — PSP/GSP callbacks

**Depends on:** Task 1
**Goal:** Safely receive payment-provider webhooks: validate the tenant,
deduplicate, and persist the raw event — with no balance side effects.

## Scope

- `callbacks` module with:
  - `POST /webhooks/psp/:provider`
  - `POST /webhooks/gsp/:provider`
- For each callback:
  1. Resolve `brandId` from the request (tenant context).
  2. Derive the idempotency key (provider event id or `Idempotency-Key` header).
  3. Check `idempotency_keys` scoped by `brandId`; if present, return `200` as a
     no-op (`status: "duplicate"`).
  4. Otherwise insert the key and store the verbatim payload in `raw_events`,
     then return `200` (`status: "accepted"`).
- Rely on the DB unique constraint on `(brandId, key)` so concurrent duplicates
  cannot both insert.

## Acceptance criteria

- First delivery is stored once; a duplicate delivery is deduplicated (no second
  `raw_events` row).
- The handler never updates a balance or triggers business processing.
- Events are stored under the correct `brandId`; the same key under two brands
  does not collide.
- Malformed payloads return a structured `422`.

## References

- Webhook lifecycle (mermaid) → [../ARCHITECTURE.md](../ARCHITECTURE.md#webhook-lifecycle)
- Endpoints & examples → [../API.md](../API.md#post-webhookspspprovider)
- Invariants → [../../AGENTS.md](../../AGENTS.md), [../../CLAUDE.md](../../CLAUDE.md)
- Decisions → [../DECISIONS.md](../DECISIONS.md) (ADR-4, ADR-5, ADR-6)

## Out of scope

- Consuming/processing `raw_events` (future ledger). Provider signature
  verification beyond a shared secret (note it as a follow-up).
