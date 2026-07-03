# Sprint 1 — Design Review Revision

Date: 2026-07-03

This amendment revisits the Sprint 1 visual baseline without rolling back the validated Sprint 2 contracts.

## Accepted changes

- Expanded the desktop sidebar with clearly non-interactive planned work queues and operational views.
- Removed the low-value breadcrumb.
- Added compact page metadata for open volume, urgent volume, and average SLA.
- Increased the search field to 460 px at supported desktop widths.
- Expanded the deterministic preview from 3 to 10 realistic task records.
- Moved vertical scrolling into the task table and made the column header sticky.
- Tightened table column proportions, especially SLA and Exposure.
- Increased the visual priority of `Needs approval` without making every badge equally loud.
- Added restrained row-hover feedback without implying an executable action.

## Deliberately deferred

- Sidebar entries are marked `aria-disabled` rather than implemented as false navigation links.
- `Open task` and row navigation remain Sprint 3 work because no approved destination exists yet.
- Avatar role/menu behavior remains deferred until identity and authentication semantics exist.
- The Foundation Preview boundary remains visible while the application is demonstration-only.

## Browser Design QA

At 1280×720:

- No document-level horizontal overflow.
- Task table viewport is 400 px high with 680 px of scrollable content.
- Table header uses sticky positioning.
- Page height is effectively viewport-bound; queue scrolling is contained.

At 1024×768:

- No document-level horizontal overflow.
- Task table viewport is 448 px high with 680 px of scrollable content.
- The scroll region remains keyboard-focusable.

## Verification

| Gate | Result |
|---|---:|
| ESLint | Passed |
| TypeScript | Passed |
| Vitest | 5 files, 6 tests passed |
| Next.js production build | Passed |
| Playwright | 6 tests passed across desktop and laptop projects |
| Axe | Zero automatically detectable violations in both projects |

The Sprint 1 baseline is approved for review again. Sprint 3 remains unstarted.
