# TravelOps AI Worker

Enterprise agentic workflow for safely handling travel-operation requests such as refunds, ticket changes, cancellations, and booking issues.

## Current status

Frontend Sprint 7 and Backend Sprint 7 are complete. The Docker Compose application now serves the
Task Inbox and RF-1042 Workspace through FastAPI and durable PostgreSQL booking/customer snapshots,
with validated API contracts and real desktop/laptop E2E coverage. Typed booking/customer/refund tools
now execute against a deterministic provider simulator, with persisted redacted attempts, idempotent
receipts, and explicit side-effect knowledge for controlled failures. A durable LangGraph refund flow
now classifies a request, applies deterministic eligibility/risk rules, and persists a versioned draft
proposal with PostgreSQL checkpoints. Versioned policy ingestion, filtered pgvector retrieval,
immutable evidence snapshots, safe abstention, and a small retrieval benchmark are implemented.
Approval mutation, authentication, production telemetry, real embedding/model providers, and real
external providers remain unimplemented.

## Start the frontend

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:3000/tasks` for the operator workflow or `http://127.0.0.1:3000/evidence` for Technical Evidence.

## Start the development stack

Docker-verified command:

```powershell
docker compose -f compose.dev.yaml up --build
```

See [development containers](./docs/development/CONTAINERS.md) for smoke testing, data lifecycle, and
the optional Podman compatibility notes.

## Source of truth

- [Product blueprint](./BLUEPRINT.md)
- [Implementation plan](./IMPLEMENTATION_PLAN.md)
- [Backend and platform delivery roadmap](./BACKEND_PLATFORM_DELIVERY_ROADMAP.md)
- [Backend delivery contract](./docs/backend/DELIVERY_CONTRACT.md)
- [API conventions](./docs/api/CONVENTIONS.md)
- [Engineering conventions](./ENGINEERING_CONVENTIONS.md)
- [Product UX Architecture](./design-research/PRODUCT_UX_ARCHITECTURE.md)
- [UI/UX Design Bible](./design-research/ENTERPRISE_AGENTIC_WORKFLOW_UI_UX_DESIGN_BIBLE.md)
- [UI/UX Blueprint](./design-research/TRAVELOPS_UI_UX_BLUEPRINT.md)
- [Architecture decisions](./docs/adr/README.md)
- [Sprint 1 evidence](./docs/evidence/sprint-1/SPRINT_1_REVIEW.md)
- [Sprint 1 design revision](./docs/evidence/sprint-1/SPRINT_1_REVISION.md)
- [Sprint 2 evidence](./docs/evidence/sprint-2/SPRINT_2_REVIEW.md)
- [Sprint 3 evidence](./docs/evidence/sprint-3/SPRINT_3_REVIEW.md)
- [Sprint 4 evidence](./docs/evidence/sprint-4/SPRINT_4_REVIEW.md)
- [Sprint 5 evidence](./docs/evidence/sprint-5/SPRINT_5_REVIEW.md)
- [Sprint 6 evidence](./docs/evidence/sprint-6/SPRINT_6_REVIEW.md)
- [Sprint 7 evidence](./docs/evidence/sprint-7/SPRINT_7_REVIEW.md)
- [Backend Sprint 0 evidence](./docs/evidence/backend-sprint-00/README.md)
- [Backend Sprint 1 evidence](./docs/evidence/backend-sprint-01/README.md)
- [Backend Sprint 2 evidence](./docs/evidence/backend-sprint-02/README.md)
- [Backend Sprint 3 evidence](./docs/evidence/backend-sprint-03/README.md)
- [Backend Sprint 4 evidence](./docs/evidence/backend-sprint-04/README.md)
- [Backend Sprint 5 evidence](./docs/evidence/backend-sprint-05/README.md)
- [Backend Sprint 6 evidence](./docs/evidence/backend-sprint-06/README.md)
- [Backend Sprint 7 evidence](./docs/evidence/backend-sprint-07/README.md)
- [Database migration runbook](./docs/runbooks/DATABASE_MIGRATIONS.md)

## Verification

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Do not claim production readiness. Authentication, backend integration, security enforcement, observability, and operational readiness remain future work.
