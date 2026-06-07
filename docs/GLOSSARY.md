# Glossary

Domain terms used across the docs and code, in plain language. This is the
fastest way for a reviewer (or an AI assistant) to answer "what does X mean here".
For how these concepts fit together, see [ARCHITECTURE.md](./ARCHITECTURE.md).

| Term | Meaning in this project |
|---|---|
| **PSP** | Payment Service Provider (e.g. Stripe). An external system that processes payments and notifies us via webhooks. |
| **GSP** | A second class of payment provider with an identical intake contract to PSP. Handled by a parallel endpoint, same lifecycle. |
| **Webhook / callback** | An inbound HTTP request the provider sends *to us* to report an event (e.g. "payment succeeded"). We receive it at `POST /webhooks/{psp,gsp}/:provider`. |
| **Idempotency** | Processing a repeated delivery of the same event only once. Providers retry webhooks on network failures, so the same event can arrive several times; we store it at most once. See [ADR-4](./DECISIONS.md#adr-4-idempotency-via-a-dedicated-idempotency_keys-table). |
| **Idempotency key** | The unique identifier of an event (provider event id, or the `Idempotency-Key` header) used to detect duplicates. Stored per brand in `idempotency_keys`. |
| **Tenant / `brandId`** | A tenant is one brand (customer) using the service. `brandId` marks which brand owns a row. Every storage query is filtered by it so brands can never see each other's data. |
| **Tenant isolation** | The guarantee that Brand A cannot read or write Brand B's data, enforced by filtering on `brandId` in the `persistence` layer. Covered by a tenant-leakage test. |
| **Tenant context** | The request-scoped `brandId` for the current request (from a JWT on user routes, from `X-Brand-Id` on webhooks), threaded into every query. |
| **`raw_events`** | Table holding the verbatim, unprocessed webhook payload (outbox-like). The intake path only writes here; nothing is interpreted at receive time. |
| **Outbox-like** | The pattern of persisting an event first and processing it later by a separate consumer, instead of doing the work inline at receive time. |
| **Ledger** | The (future, out-of-scope) component that actually moves money by reading `raw_events`. Intentionally not built here — the service is only made *ready* for it. |
| **No balance mutation in adapters** | The invariant that webhook handlers never update balances or trigger business side effects; they only persist the raw event. |
| **Correlation id** | A unique id assigned to each incoming request and attached to all of its log lines, so a single callback can be traced end to end. |
| **Structured error** | An error response with a clear HTTP status and a consistent JSON shape. See [API error format](./API.md#error-format). |
| **ADR** | Architecture Decision Record — a short note capturing the context, decision, and consequences/trade-offs of one design choice. See [DECISIONS.md](./DECISIONS.md). |
