# Backend Sprint 2 Review

Status: Engineering review complete; awaiting human approval for Backend Sprint 3.

## Goal

Persist the minimum durable state required to create a refund task and track an agent run safely
through PostgreSQL transactions and optimistic concurrency.

## Delivered

- SQLAlchemy 2 PostgreSQL connection and transaction boundary.
- Alembic configuration and initial reversible migration.
- Exactly four persisted tables: `tasks`, `requests`, `agent_runs`, and `audit_events`.
- Pydantic domain contracts for Task, Request, AgentRun, and AuditEvent.
- All eight canonical workflow states and explicit transition rules.
- Task, run, and audit repositories.
- Task and run services writing state and audit evidence in one transaction.
- Integer-version optimistic concurrency.
- UTC-only request timestamp validation.
- PostgreSQL-backed readiness with `healthy`, `not_configured`, and `unavailable` semantics.
- Idempotent deterministic seed for demo task `RF-1042` and run `AR-8821`.
- Migration and rollback runbook.

## Verification

Tests ran against PostgreSQL 16, not SQLite:

```text
Ruff check: passed
Ruff format --check: passed
Mypy strict: passed, 32 source files checked
Pytest: 35 passed
Coverage: 99%
Migration empty → head: passed
Migration head → base → head: passed
Alembic model drift check: no new operations detected
Seed first run: RF-1042 and AR-8821 created
Seed second run: no changes made
```

Integration coverage includes:

- task, request, and audit atomic commit;
- transaction rollback after a uniqueness failure;
- stale run version conflict with no extra audit event;
- invalid run-state transition rejection;
- persistence reload through a newly constructed database boundary;
- real PostgreSQL readiness;
- unavailable PostgreSQL readiness returning `503`;
- migration table allowlist.

## Failures discovered during QA

### Readiness connection timeout

The first unavailable-database test did not complete promptly because the driver had no explicit
connection timeout. This would allow a dependency outage to consume health-check capacity.

The PostgreSQL engine now uses a two-second connection timeout. The same failure test completes and
returns `503` with `database.status = unavailable`.

### Untested contract branches

The first coverage pass was 93%. Review showed that application errors, request validation, audit
readback, and unavailable readiness were registered but not executed. Tests were added because these
are contract and recovery paths, not to manufacture a coverage score. Final coverage is 99%.

## Decisions and trade-offs

- Used synchronous SQLAlchemy and Psycopg inside explicit service boundaries. Async database access
  is deferred until measured concurrency requires it.
- PostgreSQL is the only persistence target; SQLite is not used as a misleading substitute.
- Workflow states are strings protected by database checks and domain enums, avoiding PostgreSQL enum
  migration friction.
- JSONB exists only for bounded audit event data.
- Services own transactions; repositories flush but do not commit.
- Queue delivery and LangGraph checkpoints remain separate future concerns.

## Rejected scope

- BookingSnapshot and CustomerSnapshot tables.
- Policy, proposal, approval, and external-execution tables.
- Redis, queue worker, LangGraph, and model SDK.
- Generic unit-of-work framework or event-sourcing platform.
- Compose configuration; the PostgreSQL container was a temporary test dependency only.

## Known limitations

- No task or run API endpoint exists yet.
- Database credentials are still local-development values.
- Audit actor identity is a typed label, not authenticated identity.
- There is no backup automation or production restore rehearsal.
- PostgreSQL container lifecycle becomes a documented development contract in Backend Sprint 3.

## Review verdict

Backend Sprint 2 meets its Definition of Done. Backend Sprint 3 remains blocked until human approval.

