# Sprint 4 — Engineering and Design Review

Date: 2026-07-03

## Outcome

Sprint 4 is complete. Every deterministic queue task now opens a durable `/tasks/[taskId]` workspace. The flagship RF-1042 scenario demonstrates the complete pre-approval refund review; Sprint 5 approval decisions and mutations have not started.

## Delivered

- Runtime-validated workspace, evidence, risk, recommendation, action, and activity contracts.
- Isolated repository access for all ten deterministic task scenarios.
- Queue task links and row/keyboard opening behavior.
- Customer request and booking/customer fact presentation.
- Cited policy evidence with clause, excerpt, and effective date.
- Deterministic risk outcomes separated from the AI recommendation.
- Concise recommendation summary, confidence, and explicit uncertainty.
- Exact proposed tool name, parameters, version, approval requirement, and expected postcondition.
- Business activity preview without raw prompts, traces, or chain-of-thought.
- Sticky desktop context rail and accessible laptop context tabs.
- Honest disabled mutation controls and explicit Sprint 5 boundary.

## Architecture review

```text
validated workspace fixture
→ TaskRepository.getTaskWorkspace(taskId)
→ dynamic /tasks/[taskId] route
→ task workspace consumer
```

- Task summaries remain the queue contract; workspace data is a separate bounded aggregate.
- Policy evidence, deterministic risk, and AI recommendation are distinct objects and visual regions.
- Repository callers receive structured clones and cannot mutate shared fixtures.
- Unknown task IDs return `null` and resolve through the route's not-found boundary.
- Purple is used only for AI recommendation semantics.
- No approval Boolean was added to Task and no execution side effect was simulated.

## Design QA

- Desktop preserves narrative decision work in the main column and a sticky 32% context rail.
- Laptop removes the permanent rail and exposes Booking & customer, Evidence, and Risk checks as keyboard-operable tabs.
- Status, SLA, customer intent, recommendation, cited evidence, exact payload, and expected postcondition follow the approved hierarchy.
- The approval threshold is stated in business language and not communicated by color alone.
- Visual browser inspection at the default desktop viewport found balanced hierarchy and no console warnings/errors.
- Axe found no automatically detectable violations on the workspace in desktop or laptop projects.

## Verification

| Gate | Result |
|---|---:|
| ESLint | Passed |
| TypeScript | Passed |
| Vitest | 8 files, 14 tests passed |
| Playwright | 20 passed, 2 intentional responsive skips |
| Axe | Zero automatically detectable violations on Inbox and Workspace |
| Next.js production build | Passed |

The responsive skips are reciprocal: the desktop-only sidebar assertion is skipped on laptop, and the laptop-only context-tab assertion is skipped on desktop.

## Post-review navigation fix

Direct queue-to-workspace navigation originally used the Next client router from inside an
interactive table row. Real browser clicks could remain on the Inbox indefinitely. Task links and
row opening now use native document navigation. This deliberately trades a client-side transition
for deterministic navigation, correct browser history, and freedom from the freeze. Both title-link
and full-row navigation were reverified in the browser; the E2E suite now performs the real task-link
click instead of navigating directly to the destination.

## Deferred intentionally

- Approval reservation, decisions, reasons, modification, stale proposals, and safe mutations.
- Actual tool execution and postcondition verification.
- Full Agent Run Timeline and technical trace.
- Backend APIs, authentication, authorization, persistence, observability, and production operations.

## Gate

Stop after Sprint 4. Do not begin Sprint 5 — Approval Review without explicit approval.
