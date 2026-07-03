# Sprint 2 — Engineering and Design Review

Date: 2026-07-03

## Outcome

Sprint 2 is complete. Task Inbox now consumes validated domain data through a minimal repository boundary instead of importing presentation-shaped mock objects directly.

```text
Zod contract → deterministic fixture → named scenario → repository adapter → feature component
```

## Delivered

- `TaskSummary`, `Money`, task-type, and task-status schemas with runtime validation.
- `TaskRepository` interface and asynchronous in-memory adapter.
- Deterministic, named Task Inbox scenario.
- Generic semantic `DataTable` adapter backed by TanStack Table.
- Consumed `StatusBadge` and `InlineBanner` primitives.
- Contract, repository, and component tests.
- Component maturity ledger in `frontend/src/components/README.md`.

Only Zod and TanStack Table were added. Query caching, forms, URL-state libraries, and speculative UI primitives were deferred until a feature requires them.

## Engineering review

- Domain values are validated at the fixture boundary; unsupported values fail early.
- Repository callers receive copies, preventing accidental mutation of shared fixtures.
- Currency rendering uses the domain currency instead of a hard-coded symbol.
- Table markup retains native caption, header, row, and cell semantics.
- The horizontal-scroll region is named and keyboard-focusable. This fixes the serious `scrollable-region-focusable` violation detected at the laptop breakpoint.
- A narrow React Compiler ESLint suppression exists only at the TanStack adapter boundary because TanStack owns its memoization. The global rule remains enabled.

## Design QA

Verified directly at 1280×720 and 1024×768:

- No document-level horizontal overflow at either viewport.
- The table owns its horizontal overflow and remains keyboard reachable.
- Existing task-first hierarchy, spacing, badges, and restrained operational styling are preserved.
- Clean Playwright projects completed without application errors.
- Accessibility tree exposes a named region and semantic table structure.

The desktop image reuses the approved Sprint 1 visual baseline because Sprint 2 intentionally
changed data and component boundaries without redesigning the visible surface. Current responsive
behavior and semantics were verified separately in the browser and E2E suite.

## Verification

| Gate | Result |
|---|---:|
| ESLint | Passed |
| TypeScript | Passed |
| Vitest | 5 files, 6 tests passed |
| Next.js production build | Passed |
| Playwright | 6 tests passed across desktop and laptop projects |
| Axe | Zero automatically detectable violations in both projects |

## Deferred intentionally

- Interactive search, filtering, sorting, pagination, and URL-owned state.
- TanStack Query and remote-state semantics.
- Timeline, approval, evidence, loading, empty, error, and skeleton components.
- Backend APIs, authentication, authorization, policy retrieval, agent runs, and execution.

These are not Sprint 2 defects. They belong to consumer-led later sprints.

## Gate

Stop after Sprint 2. Do not begin Sprint 3 — Task Inbox without explicit approval.
