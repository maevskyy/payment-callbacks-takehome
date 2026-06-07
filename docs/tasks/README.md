# Implementation tasks

The build is split into 5 sequential tasks. Each task file is self-contained:
goal, scope, acceptance criteria, and links to the relevant docs. An AI assistant
(or a human) should be able to pick up one task and complete it in isolation.

| # | Task | Depends on |
|---|---|---|
| 1 | [task_init_repo_1.md](./task_init_repo_1.md) — bootstrap project & cross-cutting layer | — |
| 2 | [task_identity_2.md](./task_identity_2.md) — auth + profile | 1 |
| 3 | [task_callbacks_3.md](./task_callbacks_3.md) — PSP/GSP webhooks | 1 |
| 4 | [task_tests_4.md](./task_tests_4.md) — unit + integration + tenant-leakage tests | 2, 3 |
| 5 | [task_nice_to_have_5.md](./task_nice_to_have_5.md) — OpenAPI, compose, contract test | 2, 3 |

Context for every task: [../../CLAUDE.md](../../CLAUDE.md) (invariants),
[../ARCHITECTURE.md](../ARCHITECTURE.md), [../API.md](../API.md),
[../DECISIONS.md](../DECISIONS.md).
