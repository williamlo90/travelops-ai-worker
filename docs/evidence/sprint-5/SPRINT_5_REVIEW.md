# Sprint 5 — Engineering and Design Review

Date: 2026-07-03

## Outcome

Sprint 5 is complete. Approval Review is now a distinct decision experience reached from Task
Workspace. It records safe, local mock decisions but never executes a travel-provider action.

## Delivered

- Durable `/tasks/[taskId]/approval` route.
- Full-page evidence and decision layout rather than a duplicated Workspace or confirmation modal.
- Proposal and evidence versions displayed and bound to every decision.
- Visible reviewer reservation and expiry state.
- Immutable tool name, parameters, amount, evidence, risk triggers, and expected postcondition.
- Required decision reason with preserved input after validation failure.
- Approve, Reject, and Request information mock decisions.
- Attributable decision record containing reviewer, outcome, reason, versions, and timestamp.
- Stale-proposal and expired-reservation blocking scenarios.
- Explicit statement that approval does not execute the external action.

## Architecture review

The pure `submitMockApprovalDecision` domain function rejects non-pending, expired, stale, and
invalid commands before producing a new validated state. UI state is presentation/demo persistence
only; it is not represented as backend authorization or durable storage.

## Design QA

- Evidence precedes risk, reason, and decision controls in focus/document order.
- Desktop uses an evidence-heavy split with a sticky decision rail.
- Laptop stacks the rail without losing immutable proposal context.
- Primary action names the exact amount and side effect.
- Validation is inline and retains the entered reason.
- Stale and expired states explain why decisions are blocked.
- Axe found no automatically detectable violations in desktop or laptop projects.

## Verification

| Gate | Result |
|---|---:|
| ESLint | Passed |
| TypeScript | Passed |
| Vitest | 10 files, 18 tests passed |
| Playwright | 28 passed, 2 intentional responsive skips |
| Axe | Zero automatically detectable violations |
| Next.js production build | Passed |

## Deferred intentionally

- Real authentication, authority enforcement, persistence, and reservation service.
- Tool execution, retry, idempotency, receipts, and postcondition verification.
- Full Agent Run Timeline, uncertain outcomes, and recovery controls.
- Approval queue and cross-reviewer concurrency.

## Gate

Stop after Sprint 5. Do not begin Sprint 6 — Agent Run Timeline without explicit approval.
