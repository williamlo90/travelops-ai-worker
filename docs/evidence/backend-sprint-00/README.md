# Backend Sprint 0 Review

Status: Engineering review complete; awaiting human approval for Backend Sprint 1.

## Goal

Freeze the first refund vertical slice, state semantics, API conventions, local command contract,
frontend migration boundary, and evidence expectations before backend scaffolding begins.

## Delivered

- Refund backend scope and explicit non-goals.
- Five acceptance scenarios covering verified completion, safe failure, uncertain execution, stale
  approval, and invalid policy evidence.
- Canonical meanings and transitions for all eight required workflow states.
- Frontend fixture-to-backend migration map.
- API naming, timestamp, money, correlation, error, pagination, concurrency, and compatibility rules.
- Python and container command contract.
- ADR-005 for the modular monolith.
- ADR-006 for PostgreSQL as durable source of truth.
- Backend Definition of Ready and sprint evidence gate.

## Verification

- Compared the contract with current frontend Zod schemas and deterministic fixtures.
- Confirmed display statuses remain separate from backend workflow states.
- Confirmed failed-before-side-effect and uncertain-after-submission remain distinct.
- Confirmed no Sprint 0 artifact creates FastAPI, database, Redis, LangGraph, or Compose runtime.
- Confirmed architecture decisions do not imply microservices.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 14 test files and 29 tests passed.
- No product code changed.

## Decisions and trade-offs

- Selected Python 3.12 and `uv` for one reproducible dependency and command path.
- Kept public API paths unversioned until a real breaking compatibility need exists.
- Selected decimal strings for money to avoid binary floating-point ambiguity.
- Kept frontend presentation status derived rather than exposing workflow state directly.
- Kept audit read models human-readable while preserving canonical events server-side.

## Rejected scope

- Backend scaffolding.
- Database models or migrations.
- Podman Compose implementation.
- LangGraph and model-provider selection details.
- Generic workflow or microservice infrastructure.

## Known limitations

- Commands are contractual and cannot execute until their owning sprint creates the runtime.
- OpenAPI does not exist until FastAPI is scaffolded.
- Exact pagination limits and dependency versions remain Sprint 1 implementation decisions.
- Authentication actors and organization boundaries are deferred to the security roadmap while
  server-side authority remains a mandatory design rule.

## Review verdict

Sprint 0 meets its documentation-only Definition of Done. Backend Sprint 1 remains blocked until
human approval.
