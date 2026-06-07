# Task 5 — Nice-to-have polish

**Depends on:** Task 2, Task 3
**Goal:** Add the optional extras that raise quality and make the project easy for
a reviewer to run and inspect.

## Scope

- **OpenAPI/Swagger**: annotate controllers/DTOs and expose a generated spec
  (e.g. `/docs`). Keep it consistent with [../API.md](../API.md).
- **docker-compose**: finalize app + DB so a reviewer runs the whole thing with
  one command; confirm the README flow works from a clean checkout.
- **Contract test** for the webhook payload schema: validate that an incoming
  callback body matches the expected shape (reject with `422` otherwise).

## Acceptance criteria

- Swagger UI loads and lists all endpoints with example payloads.
- `docker-compose up` from a clean clone yields a working API per the README.
- The contract test fails on a malformed webhook body and passes on a valid one.

## References

- Endpoints & error format → [../API.md](../API.md)
- Run flow → [../../README.md](../../README.md#setup--run)
- Decisions → [../DECISIONS.md](../DECISIONS.md)

## Out of scope

- Anything not listed in the assignment's "Nice to Have" section.
