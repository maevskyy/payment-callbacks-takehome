# Task 2 — Identity (auth + profile)

**Depends on:** Task 1
**Goal:** Let a user register, log in, and fetch their own profile — scoped to
their brand.

## Scope

- `identity` module with:
  - `POST /auth/register` — create a user under a `brandId`; hash the password;
    reject duplicate `(brandId, email)` with `409`.
  - `POST /auth/login` — verify credentials, issue a JWT, persist the session in
    `sessions`.
  - `GET /profile/me` — protected; resolve the user from the token's tenant
    context and return the profile.
- An auth guard that validates the JWT and populates the tenant context with the
  token's `brandId`.

## Acceptance criteria

- Register → login → `/profile/me` works end to end.
- `/profile/me` without a valid token returns `401`.
- The profile is always resolved within the token's `brandId` — a Brand A token
  can never surface Brand B data.
- Passwords are stored hashed, never in plaintext.

## References

- Endpoints & examples → [../API.md](../API.md)
- Invariants (tenant isolation) → [../../CLAUDE.md](../../CLAUDE.md#hard-invariants-never-violate)
- Decisions → [../DECISIONS.md](../DECISIONS.md) (ADR-3, ADR-6)

## Out of scope

- Webhooks (Task 3). Token refresh/logout flows (not required by the assignment).
