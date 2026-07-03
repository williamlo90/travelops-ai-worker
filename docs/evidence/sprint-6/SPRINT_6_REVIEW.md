# Sprint 6 — Engineering and Design Review

Date: 2026-07-03

## Outcome

Sprint 6 is complete. Agent Run Timeline is now a durable experience reached from Task Workspace.
It explains execution in business language, exposes bounded diagnostic details, and prevents a
failed request from being confused with an uncertain request that may already have caused a side
effect.

## Delivered

- Durable `/tasks/[taskId]/runs/[runId]` route and Workspace handoff.
- Completed, failed-before-side-effect, and uncertain-after-submission scenarios.
- Business event labels before technical operation names.
- Inline expansion for safe input, output, attempt, error, side-effect, evidence, and correlation data.
- Completed status only after an external postcondition is represented as verified.
- Safe retry only when the failure confirms that no external side effect occurred.
- Reconciliation-first recovery when an external side effect may have occurred.
- Explicit run, proposal, task, duration, event-count, and scenario context.
- Deterministic demo disclosure and explicit exclusion of raw technical spans.

## Architecture review

Validated run fixtures carry explicit `sideEffect` and `recovery` semantics. Failed execution is
eligible for retry only when side effect is `none`; uncertain execution carries `possible` side
effect and permits reconciliation instead. The completed scenario includes a separate external
verification event rather than treating tool submission as proof of completion.

The recovery interactions are local presentation state only. They do not call a provider, enqueue
work, persist a command, or claim backend authorization.

## Design QA

- Run outcome and recovery guidance appear before the detailed event list.
- Business labels and summaries dominate; operation names remain secondary.
- Expanded details stay bounded and do not expose prompts, chain-of-thought, secrets, or raw payloads.
- The uncertain state removes blind retry and gives one clear reconciliation action.
- The failed state explains why retry is safe before exposing the mock retry control.
- Browser inspection at desktop width found no horizontal overflow and no console warnings or errors.
- Axe found no automatically detectable violations in the tested desktop projects.

## Verification

| Gate | Result |
|---|---:|
| ESLint | Passed |
| TypeScript | Passed |
| Vitest | 12 files, 24 tests passed |
| Playwright | 36 passed, 2 intentional responsive skips |
| Axe | Zero automatically detectable violations |
| Next.js production build | Passed |
| Browser visual and console QA | Passed |

## Scenario URLs

- Completed: `/tasks/RF-1042/runs/AR-8821`
- Failed before side effect: `/tasks/RF-1042/runs/AR-8821?scenario=failed`
- Uncertain after submission: `/tasks/RF-1042/runs/AR-8821?scenario=uncertain`

## Deferred intentionally

- Real tool execution, provider integration, retries, idempotency enforcement, and reconciliation.
- Durable event storage, authentication, authorization, and audit immutability.
- Raw traces, spans, provider payloads, evaluation evidence, and observability integration.
- Operational alerting, SLOs, performance evidence, and production incident workflows.

## Gate

Stop after Sprint 6. Do not begin Sprint 7 — Technical Evidence without explicit approval.
