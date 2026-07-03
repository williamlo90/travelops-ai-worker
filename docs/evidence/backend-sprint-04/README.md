# Backend Sprint 4 Review

Status: Engineering review complete; awaiting human approval for Backend Sprint 5.

## Goal

Replace Task Inbox and Task Workspace fixture reads with a real FastAPI/PostgreSQL path while
preserving the established operator UX and keeping deterministic mock mode available.

## Delivered

- `GET /api/tasks` with allowlisted sorting, filtering, opaque cursor pagination, limits, and search.
- `GET /api/tasks/{task_id}` with stable 404 error envelope.
- Immutable `customer_snapshots` and `booking_snapshots` tables.
- Task read fields for summary, SLA deadline, and exposure.
- Reversible Alembic revision `20260703_0002`.
- Pydantic CustomerSnapshot and BookingSnapshot contracts.
- Hand-written, Zod-validated frontend API adapter; no generated client added.
- Explicit mock/API repository selection through `TRAVELOPS_DATA_MODE`.
- Separate internal container URL and public browser API URL.
- API-backed demo label; backend failure never falls back silently to fixtures.
- Loading, error, empty, custom not-found, and existing workspace states.
- Real frontend-backend Playwright flow for desktop and laptop.

## Scope truth

Only RF-1042 is implemented through the backend because the flagship backend scope remains one deep
refund workflow. The other frontend task types remain available only in explicit mock mode.

Policy, risk, recommendation, and proposed-action sections returned by the detail endpoint are a
clearly labelled deterministic demo projection over persisted request, booking, and customer context.
They are not claimed as live RAG or model output and will be replaced by their owning later sprints.

## Verification

Backend:

```text
Ruff check and format: passed
Mypy strict: passed, 38 source files checked
Pytest: 40 passed
Coverage: 99%
Migration empty → head: passed
Task filters/search/sort/pagination: passed
404, invalid cursor, and missing database: passed
```

Frontend:

```text
ESLint: passed
TypeScript: passed
Vitest: 15 files, 33 tests passed
Production build: passed
API E2E: 4/4 passed across desktop and laptop Chromium
```

Browser QA confirmed:

- Inbox displays `API-backed demo data`.
- RF-1042 originates from `GET /api/tasks`.
- Inbox opens durable `/tasks/RF-1042`.
- BA218, Maria Santos, and Refund Policy render in the real API path.
- `/tasks/RF-9999` renders a controlled task-not-found state.

## Failures discovered during QA

### UTC serialization mismatch

PostgreSQL timestamps were serialized as `+00:00`, while the approved frontend contract requires an
RFC 3339 UTC `Z` suffix. Browser navigation reached the error boundary even though the backend
returned `200`.

The backend now normalizes public timestamps to `Z`; the frontend validator was not weakened.

### Test environment inherited a database

The missing-database test inherited `TRAVELOPS_DATABASE_URL` from the migration fixture and returned
`200`. The test now clears the database setting explicitly and proves the intended `503` boundary.

### Responsive E2E context

Booking and evidence live in different responsive surfaces. E2E assertions now target the visible
desktop context rail or laptop tabpanel instead of relying on ambiguous global text.

### Build-time repository selection

The first production build prerendered `/tasks` while mock mode was active. A later runtime API
environment could therefore inherit build-time mock output. Task Inbox is now explicitly dynamic so
repository selection occurs at request time; the verified build reports `/tasks` as server-rendered.

## Decisions and trade-offs

- Selected one hand-written adapter because only two endpoints exist; client generation is deferred.
- Kept frontend filtering for immediate UX continuity while the backend contract independently proves
  server filters and pagination.
- Did not import frontend fixtures in API-mode pages.
- Did not add React Query or polling before a long-running API consumer exists.
- Kept demo projection metadata explicit rather than implying orchestration already exists.

## Rejected scope

- Task ingestion API.
- Approval or execution mutations.
- LangGraph, RAG, model SDK, Redis, and WebSocket.
- Backend implementation of ticket change or booking issue.
- Authentication and authorization claims.

## Known limitations

- API mode exposes one refund task only.
- Agent-derived workspace sections remain deterministic demo projections.
- Task Inbox filters execute client-side after one bounded API read.
- No authenticated actor or tenant boundary exists.

## Review verdict

Backend Sprint 4 meets its Definition of Done. Backend Sprint 5 remains blocked until human approval.
