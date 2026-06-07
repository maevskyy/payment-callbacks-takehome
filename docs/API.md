# API

Base URL: `http://localhost:3000`

All requests and responses are JSON. Protected endpoints require a
`Authorization: Bearer <token>` header. Every request may include an
`X-Correlation-Id` header; if omitted, the server generates one and echoes it
back in the response (see [CLAUDE.md](../CLAUDE.md#hard-invariants-never-violate)).

For data model and lifecycle, see
[ARCHITECTURE.md](./ARCHITECTURE.md).

## Endpoints overview

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | no | Create a user under a brand |
| POST | `/auth/login` | no | Authenticate, receive a JWT |
| GET | `/profile/me` | yes | Return the current user's profile |
| POST | `/webhooks/psp/:provider` | signature/secret | Receive a PSP callback |
| POST | `/webhooks/gsp/:provider` | signature/secret | Receive a GSP callback |

---

## POST /auth/register

Request:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{ "brandId": "brand-a", "email": "user@brand-a.com", "password": "secret123" }'
```

Response `201 Created`:
```json
{ "id": "u_123", "brandId": "brand-a", "email": "user@brand-a.com" }
```

---

## POST /auth/login

Request:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{ "brandId": "brand-a", "email": "user@brand-a.com", "password": "secret123" }'
```

Response `200 OK`:
```json
{ "accessToken": "eyJhbGciOiJIUzI1Ni␣...", "expiresIn": "1h" }
```

---

## GET /profile/me

Request:
```bash
curl http://localhost:3000/profile/me \
  -H 'Authorization: Bearer <token>'
```

Response `200 OK`:
```json
{ "id": "u_123", "brandId": "brand-a", "email": "user@brand-a.com" }
```

The profile is resolved from the token's tenant context, so a Brand A token can
never return Brand B data.

---

## POST /webhooks/psp/:provider

`:provider` is the provider name, e.g. `stripe`. The request carries the event
payload and an idempotency key (provider event id or `Idempotency-Key` header).

Request:
```bash
curl -X POST http://localhost:3000/webhooks/psp/stripe \
  -H 'Content-Type: application/json' \
  -H 'X-Brand-Id: brand-a' \
  -H 'Idempotency-Key: evt_abc_123' \
  -d '{ "eventId": "evt_abc_123", "type": "payment.succeeded", "amount": 1000 }'
```

Response `200 OK` (first delivery — stored):
```json
{ "status": "accepted", "eventId": "evt_abc_123" }
```

Response `200 OK` (duplicate delivery — deduplicated, no-op):
```json
{ "status": "duplicate", "eventId": "evt_abc_123" }
```

The handler only persists the payload to `raw_events`; it never mutates balances.

---

## POST /webhooks/gsp/:provider

Identical contract to the PSP endpoint, for GSP providers.

Request:
```bash
curl -X POST http://localhost:3000/webhooks/gsp/acme \
  -H 'Content-Type: application/json' \
  -H 'X-Brand-Id: brand-a' \
  -H 'Idempotency-Key: evt_xyz_789' \
  -d '{ "eventId": "evt_xyz_789", "type": "settlement.completed", "amount": 5000 }'
```

Response `200 OK`:
```json
{ "status": "accepted", "eventId": "evt_xyz_789" }
```

---

## Error format

All errors share a consistent shape with a clear HTTP status code:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Human-readable explanation",
  "correlationId": "req_a1b2c3"
}
```

Common status codes:

| Status | When |
|---|---|
| `400 Bad Request` | Malformed body / missing required fields |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Tenant mismatch (wrong `brandId` for the resource) |
| `404 Not Found` | Resource does not exist within the tenant |
| `409 Conflict` | Duplicate registration or conflicting state |
| `422 Unprocessable Entity` | Webhook payload fails schema validation |
