# Task 4 — Tests

**Depends on:** Task 2, Task 3
**Goal:** Prove the three behaviours the assignment evaluates: business logic,
callback idempotency, and tenant isolation.

## Scope

- **Unit test** for callback use-case logic (e.g. the dedup decision: known key →
  no-op, new key → store).
- **Integration test** for callback idempotency: send the same callback twice and
  assert exactly one `raw_events` row and a `duplicate` response on the second.
- **Tenant-leakage test**: authenticate as Brand A and assert it cannot read or
  affect Brand B data (profile and/or stored events).

## Acceptance criteria

- `npm test` runs the unit test green.
- `npm run test:e2e` runs the idempotency and tenant-leakage tests green.
- Tests are deterministic and run from a clean DB state (no manual setup).

## References

- Invariants → [../../AGENTS.md](../../AGENTS.md), [../../CLAUDE.md](../../CLAUDE.md)
- Architecture → [../ARCHITECTURE.md](../ARCHITECTURE.md)
- Run commands → [../../README.md](../../README.md#tests)

## Out of scope

- Load/performance testing. Full coverage of every endpoint — focus on the three
  required behaviours.
