# TravelOps AI Worker — Frontend Implementation Plan

Status: Sprint 7 implemented and verified. The approved frontend sprint sequence is complete.

## Approved technical baseline

- Frontend location: `frontend/`
- Runtime: Node.js 22
- Package manager: pnpm
- Framework: Next.js 16 App Router
- Language: strict TypeScript
- Styling: Tailwind CSS; shadcn/ui primitives adopted selectively
- Data: TanStack Query and TanStack Table
- Forms: React Hook Form and Zod
- Icons: Lucide
- Deferred: Zustand, Framer Motion, Recharts, next-themes/dark-mode UI

## Delivery gates

Every sprint must pass three separate gates:

1. **Engineering Review:** lint, type-check, tests, production build, architecture and dependency review.
2. **Design QA:** hierarchy, spacing, density, cognitive load, responsive behavior, accessibility, and removal of unnecessary components.
3. **Human Approval:** review evidence and explicitly authorize the next sprint.

Passing automated checks does not imply passing Design QA.

## Definition of Ready

A sprint may start only when:

- its user outcome and scope are approved;
- required source-of-truth documents have been re-read;
- unresolved document conflicts affecting the sprint are recorded;
- consumer pages are understood before shared abstractions are introduced;
- required domain/mock contracts are named and reviewable;
- external dependency additions have a stated purpose;
- acceptance criteria and verification methods are defined;
- previous sprint Engineering Review, Design QA, and Human Approval have passed.

## Sprint sequence

### Sprint 1 — Foundation

Project foundation, approved dependencies, routes, application shell, sidebar, context bar, design tokens, typography, layout primitives, quality tooling, and a presentation-quality Task Inbox shell using clearly labelled static demonstration content.

### Sprint 2 — Minimal contracts and shared primitives

Domain contracts plus only primitives required by known consumers: status, evidence, table shell, timeline event, loading, error, empty, and skeleton states. No speculative component library.

Delivered scope was deliberately narrowed to current consumers: validated task-summary contracts,
a mock repository boundary, `DataTable`, `StatusBadge`, and `InlineBanner`. Evidence, timeline,
loading, error, empty, and skeleton primitives remain deferred until a concrete consumer exists.
See `docs/evidence/sprint-2/SPRINT_2_REVIEW.md`.

### Sprint 3 — Task Inbox

Operational task table, search, filters, sorting, URL-owned state, keyboard navigation, and scenario-based mock repository.

Delivered with deterministic query parsing, saved operational views, deep-linkable selection,
empty-result recovery, and desktop/laptop acceptance coverage. See
`docs/evidence/sprint-3/SPRINT_3_REVIEW.md`.

### Sprint 4 — Task Workspace

Request, booking/customer context, policy evidence, risk checks, structured recommendation, proposed action, and activity preview.

Delivered as durable `/tasks/[taskId]` workspaces with validated scenario contracts, desktop
sticky context, laptop context tabs, exact tool parameters, and explicit non-mutation boundaries.
See `docs/evidence/sprint-4/SPRINT_4_REVIEW.md`.

### Sprint 5 — Approval Review

Version-bound proposal review, reservation, stale/expired states, decisions, reasons, and safe mock mutations.

Delivered as a distinct `/tasks/[taskId]/approval` experience with immutable proposal review,
evidence/risk context, attributable decisions, reservation expiry, stale-version blocking, and
explicitly non-executing mock state. See `docs/evidence/sprint-5/SPRINT_5_REVIEW.md`.

### Sprint 6 — Agent Run Timeline

Business event timeline, execution states, failures, uncertain outcomes, and safe recovery presentation.

Delivered as a durable `/tasks/[taskId]/runs/[runId]` experience with business-first event labels,
safe expandable details, verified external postconditions, distinct failed/uncertain semantics,
and recovery controls constrained by side-effect risk. Raw technical spans remain deferred to
Sprint 7. See `docs/evidence/sprint-6/SPRINT_6_REVIEW.md`.

### Sprint 7 — Technical Evidence

Evaluation and run evidence, failure tests, known limitations, and only claims supported by executed proof.

Delivered as a controlled `/evidence` area with a versioned deterministic evaluation dataset,
computed case results, run and recovery evidence, an intentionally preserved regression, architecture
proof, and explicit evidence gaps. It does not claim live model, provider, security, load, or production
telemetry. See `docs/evidence/sprint-7/SPRINT_7_REVIEW.md`.

## Performance budgets

Initial budgets are guardrails, not success claims:

- Route-level first-load JavaScript target: less than 250 kB compressed where Next.js build output permits measurement.
- LCP target: less than 2.5 seconds at the agreed test profile.
- CLS target: less than 0.1.
- INP target: less than 200 ms.
- No unoptimized charting, animation, or global-state dependency in Sprint 1.
- No route may block on decorative assets.

Budgets must be measured before claiming compliance. Local development timings are not production evidence.

## Component maturity

- **Experimental:** first consumer; API may change within the sprint.
- **Candidate:** at least two real consumers or a proven cross-screen contract; tested states exist.
- **Stable:** reviewed API, accessibility behavior, tests, and documentation; breaking changes require review.
- **Deprecated:** replacement and removal plan documented.

Components cannot become Stable merely because they live in `components/`.

## Mock-data policy

```text
Typed fixture
→ named scenario
→ repository adapter
→ query/data boundary
→ UI
```

- No random inline JSON in page components.
- Fixtures are deterministic and labelled as mock/demo data.
- Scenarios include happy, empty, loading, error, stale, conflict, and uncertain states as relevant.
- UI imports repository contracts, not fixture files directly.
- Mock identifiers and receipts must never be presented as real production records.

## Frontend AI boundary

The frontend:

- never calls OpenAI or another model provider directly;
- never performs policy reasoning or determines approval authority;
- never stores system prompts, chain-of-thought, provider secrets, or unrestricted raw model payloads;
- never decides whether a consequential action is permitted;
- renders structured backend/domain results and submits explicit user commands;
- treats all client-side authorization as presentation only, never enforcement.

## Sprint 1 acceptance

- Approved routes and shell render without dead navigation.
- Task Inbox is the landing route; there is no chat or KPI dashboard.
- Semantic tokens and typography match the UI/UX Blueprint.
- Full keyboard path and visible focus are present.
- Responsive shell works at approved laptop/tablet widths.
- Lint, type-check, tests, production build, accessibility checks, and browser verification are executed.
- Design QA reviews spacing, hierarchy, enterprise tone, cognitive load, and unnecessary elements.
- Screenshot evidence is captured from the real application.
