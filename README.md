# TravelOps AI Worker

Enterprise agentic workflow for safely handling travel-operation requests such as refunds, ticket changes, cancellations, and booking issues.

## Current status

Sprint 7 — Technical Evidence is implemented and verified, completing the approved frontend sprint sequence. The application now exposes a versioned deterministic evaluation dataset, computed results, run and recovery evidence, failure tests, architecture proof, and explicit evidence gaps. This remains a frontend-only demonstration: no real model, provider, backend workflow, persistence, authentication, production telemetry, or external action is present.

## Start the frontend

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:3000/tasks` for the operator workflow or `http://127.0.0.1:3000/evidence` for Technical Evidence.

## Source of truth

- [Product blueprint](./BLUEPRINT.md)
- [Implementation plan](./IMPLEMENTATION_PLAN.md)
- [Backend and platform delivery roadmap](./BACKEND_PLATFORM_DELIVERY_ROADMAP.md)
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

## Verification

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Do not claim production readiness. Authentication, backend integration, security enforcement, observability, and operational readiness remain future work.
