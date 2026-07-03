import { AgentRunSchema, type AgentRun } from "@/domain/runs/agent-run";

const baseEvents = [
  {
    id: "EV-1",
    timestamp: "2026-07-03T10:42:01.000Z",
    label: "Task classified",
    detail: "Refund request caused by carrier cancellation",
    operation: "classify_task",
    durationMs: 220,
    status: "completed",
    attempt: 1,
    sideEffect: "none",
    recovery: "none",
    safeInput: { task_id: "RF-1042" },
    safeOutput: { task_type: "refund", cause: "carrier_cancellation" },
    error: null,
    correlationId: "corr_rf1042_demo",
  },
  {
    id: "EV-2",
    timestamp: "2026-07-03T10:42:02.000Z",
    label: "Booking retrieved",
    detail: "BA218 matched an unused carrier-cancelled ticket",
    operation: "get_booking",
    durationMs: 410,
    status: "completed",
    attempt: 1,
    sideEffect: "none",
    recovery: "none",
    safeInput: { booking_id: "BA218" },
    safeOutput: { status: "cancelled", ticket_use: "unused" },
    error: null,
    correlationId: "corr_rf1042_demo",
  },
  {
    id: "EV-3",
    timestamp: "2026-07-03T10:42:03.000Z",
    label: "Policy evidence selected",
    detail: "Refund Policy §4.2 and Waiver WX-17",
    operation: "search_policy",
    durationMs: 680,
    status: "completed",
    attempt: 1,
    sideEffect: "none",
    recovery: "none",
    safeInput: { query: "carrier cancellation full refund" },
    safeOutput: { citations: "POL-REF-4.2,WVR-WX-17" },
    error: null,
    correlationId: "corr_rf1042_demo",
  },
  {
    id: "EV-4",
    timestamp: "2026-07-03T10:42:05.000Z",
    label: "Eligibility calculated",
    detail: "Full refund eligible; supervisor threshold triggered",
    operation: "check_refund_eligibility",
    durationMs: 1400,
    status: "completed",
    attempt: 1,
    sideEffect: "none",
    recovery: "none",
    safeInput: { booking_id: "BA218", policy_version: "3" },
    safeOutput: { eligible: "true", approval_required: "true" },
    error: null,
    correlationId: "corr_rf1042_demo",
  },
  {
    id: "EV-5",
    timestamp: "2026-07-03T10:46:19.000Z",
    label: "Approved by A. Rahman",
    detail: "Decision reason recorded against proposal v1 and evidence v3",
    operation: null,
    durationMs: 254000,
    status: "completed",
    attempt: 1,
    sideEffect: "none",
    recovery: "none",
    safeInput: null,
    safeOutput: { approval_reference: "APR-DEMO-1042" },
    error: null,
    correlationId: "corr_rf1042_demo",
  },
] as const;

const executionBase = {
  id: "EV-6",
  timestamp: "2026-07-03T10:46:20.000Z",
  label: "Refund request submitted",
  detail: "create_refund_request was called with the approved immutable payload",
  operation: "create_refund_request",
  durationMs: 930,
  attempt: 1,
  correlationId: "corr_rf1042_demo",
  safeInput: {
    booking_id: "BA218",
    amount: "USD 284.00",
    idempotency_key: "idem_demo_rf1042_v1",
  },
};

function makeRun(
  scenario: AgentRun["scenario"],
  execution: Record<string, unknown>,
  tail: Array<Record<string, unknown>>,
): AgentRun {
  const status =
    scenario === "completed"
      ? "verified"
      : scenario === "failed"
        ? "failed"
        : "execution_uncertain";
  return AgentRunSchema.parse({
    id: "AR-8821",
    taskId: "RF-1042",
    proposalVersion: 1,
    scenario,
    status,
    summary:
      scenario === "completed"
        ? "Refund request created and external postcondition verified"
        : scenario === "failed"
          ? "Refund request failed before a side effect occurred"
          : "Refund request timed out and the external side effect is unknown",
    startedAt: "2026-07-03T10:42:01.000Z",
    totalDurationMs: scenario === "completed" ? 260000 : 259000,
    correlationId: "corr_rf1042_demo",
    events: [...baseEvents, { ...executionBase, ...execution }, ...tail],
  });
}

export const completedRunFixture = makeRun(
  "completed",
  {
    status: "completed",
    sideEffect: "confirmed",
    recovery: "none",
    safeOutput: { external_reference: "REF-DEMO-77210", status: "pending" },
    error: null,
  },
  [
    {
      id: "EV-7",
      timestamp: "2026-07-03T10:46:21.000Z",
      label: "External result verified",
      detail: "Provider lookup confirmed one pending USD 284.00 refund",
      operation: "get_refund",
      durationMs: 380,
      status: "completed",
      attempt: 1,
      sideEffect: "confirmed",
      recovery: "none",
      safeInput: { external_reference: "REF-DEMO-77210" },
      safeOutput: { amount: "USD 284.00", status: "pending", count: "1" },
      error: null,
      correlationId: "corr_rf1042_demo",
    },
  ],
);

export const failedRunFixture = makeRun(
  "failed",
  {
    status: "failed",
    sideEffect: "none",
    recovery: "safe_retry",
    safeOutput: null,
    error: "Provider rejected the request before creating a refund: temporary validation service unavailable.",
  },
  [],
);

export const uncertainRunFixture = makeRun(
  "uncertain",
  {
    status: "uncertain",
    sideEffect: "possible",
    recovery: "reconcile",
    safeOutput: null,
    error: "Provider timed out after accepting the request; no confirmation or external reference was received.",
  },
  [],
);

export const runFixtures = {
  completed: completedRunFixture,
  failed: failedRunFixture,
  uncertain: uncertainRunFixture,
} as const;
