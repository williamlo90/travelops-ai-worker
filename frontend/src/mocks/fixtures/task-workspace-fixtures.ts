import {
  TaskWorkspaceSchema,
  type TaskWorkspace,
} from "@/domain/tasks/task-workspace";
import { foundationTaskFixtures } from "./task-summary-fixtures";

const task = foundationTaskFixtures.find((candidate) => candidate.id === "RF-1042");

if (!task) throw new Error("RF-1042 summary fixture is required");

export const refundWorkspaceFixture: TaskWorkspace = TaskWorkspaceSchema.parse({
  task,
  request: {
    receivedAt: "2026-07-03T07:42:00.000Z",
    channel: "email",
    customerMessage:
      "My flight was cancelled by the airline. Please refund the full amount to my original payment method.",
  },
  customer: {
    id: "CUS-88214",
    tier: "vip",
    locale: "en-SG",
    contact: "maria.santos@example.com",
  },
  booking: {
    status: "cancelled",
    provider: "British Airways",
    itinerary: "Singapore (SIN) → London (LHR)",
    passengers: 1,
    paidAmount: { amount: 284, currency: "USD" },
  },
  evidence: [
    {
      id: "POL-REF-4.2",
      title: "Refund Policy",
      clause: "§4.2 Carrier cancellation",
      excerpt:
        "A carrier-cancelled flight is eligible for a full refund to the original payment method.",
      effectiveDate: "01 Jan 2026",
    },
    {
      id: "WVR-WX-17",
      title: "Airline Waiver Rules",
      clause: "WX-17",
      excerpt:
        "Cancellation waiver removes the standard service fee when the operating carrier cancels.",
      effectiveDate: "15 Mar 2026",
    },
  ],
  risks: [
    {
      id: "RISK-ELIGIBILITY",
      label: "Policy eligibility",
      outcome: "passed",
      explanation: "Carrier cancellation and unused ticket satisfy §4.2.",
    },
    {
      id: "RISK-AMOUNT",
      label: "Refund approval threshold",
      outcome: "requires_approval",
      explanation: "USD 284.00 exceeds the operator threshold of USD 100.00.",
    },
    {
      id: "RISK-DATA",
      label: "Required booking data",
      outcome: "passed",
      explanation: "Payment method, ticket status, and cancellation code are present.",
    },
  ],
  recommendation: {
    outcome: "Issue a full refund",
    amount: { amount: 284, currency: "USD" },
    confidence: "high",
    decisionSummary:
      "The carrier cancelled the flight, the ticket is unused, and both applicable policy sources support a fee-free full refund.",
    uncertainty: null,
  },
  proposedAction: {
    version: 1,
    tool: "create_refund_request",
    parameters: {
      booking_id: "BA218",
      amount: 284,
      currency: "USD",
      reason_code: "CARRIER_CANCELLED",
      original_payment_method: true,
    },
    expectedPostcondition:
      "A pending USD 284.00 refund exists for BA218 and returns an external reference.",
    approvalRequired: true,
  },
  activity: [
    {
      id: "ACT-1",
      label: "Request classified",
      detail: "Refund · carrier cancellation",
      timestamp: "2026-07-03T07:42:08.000Z",
      status: "completed",
    },
    {
      id: "ACT-2",
      label: "Booking and customer retrieved",
      detail: "BA218 and CUS-88214 matched",
      timestamp: "2026-07-03T07:42:11.000Z",
      status: "completed",
    },
    {
      id: "ACT-3",
      label: "Policy evidence selected",
      detail: "Refund Policy §4.2 and Waiver WX-17",
      timestamp: "2026-07-03T07:42:14.000Z",
      status: "completed",
    },
    {
      id: "ACT-4",
      label: "Waiting for approval",
      detail: "Refund amount exceeds operator threshold",
      timestamp: "2026-07-03T07:42:18.000Z",
      status: "waiting",
    },
  ],
});

const workspaceTemplates = {
  refund: {
    policyTitle: "Refund Policy",
    clause: "§3.1 Refund assessment",
    outcome: "Assess refund eligibility",
    tool: "create_refund_request",
  },
  ticket_change: {
    policyTitle: "Ticket Change Policy",
    clause: "§2.4 Voluntary and disrupted changes",
    outcome: "Prepare an eligible ticket change",
    tool: "create_ticket_change",
  },
  booking_issue: {
    policyTitle: "Escalation SOP",
    clause: "§5.2 Supplier booking failure",
    outcome: "Escalate the booking issue with verified context",
    tool: "escalate_to_human",
  },
} as const;

export const taskWorkspaceFixtures: readonly TaskWorkspace[] = foundationTaskFixtures.map(
  (summary, index) => {
    if (summary.id === refundWorkspaceFixture.task.id) return refundWorkspaceFixture;
    const template = workspaceTemplates[summary.type];
    const amount = summary.exposure ?? { amount: 150, currency: "USD" };

    return TaskWorkspaceSchema.parse({
      ...refundWorkspaceFixture,
      task: summary,
      request: {
        receivedAt: `2026-07-03T07:${String(43 + index).padStart(2, "0")}:00.000Z`,
        channel: index % 2 ? "chat" : "email",
        customerMessage: `${summary.summary}. Please review the booking and advise the safest next action.`,
      },
      customer: {
        id: `CUS-${88000 + index}`,
        tier: summary.customer.isVip ? "vip" : "standard",
        locale: "en-SG",
        contact: `${summary.customer.name.toLowerCase().replaceAll(" ", ".")}@example.com`,
      },
      booking: {
        status: summary.type === "booking_issue" ? "failed" : "confirmed",
        provider: "Mock travel provider",
        itinerary: "Provider itinerary retained in the booking record",
        passengers: 1,
        paidAmount: amount,
      },
      evidence: [
        {
          id: `POL-${summary.id}`,
          title: template.policyTitle,
          clause: template.clause,
          excerpt:
            "The operator must verify booking state, applicable conditions, and authority before any external action.",
          effectiveDate: "01 Jan 2026",
        },
      ],
      risks: [
        {
          id: `RISK-${summary.id}`,
          label: "Workflow authority",
          outcome:
            summary.status === "needs_information"
              ? "needs_information"
              : summary.status === "needs_approval"
                ? "requires_approval"
                : "passed",
          explanation:
            summary.status === "needs_information"
              ? "The current fixture is missing information required for execution."
              : summary.status === "needs_approval"
                ? "The proposed action requires a supervisor decision."
                : "The task can continue through policy retrieval before a proposal is finalized.",
        },
      ],
      recommendation: {
        outcome: template.outcome,
        amount: summary.exposure,
        confidence: summary.status === "needs_information" ? "low" : "medium",
        decisionSummary:
          "The current recommendation is bounded by the available booking record and cited operating policy.",
        uncertainty:
          summary.status === "needs_information"
            ? "Required provider or customer information is incomplete."
            : null,
      },
      proposedAction: {
        version: 1,
        tool: template.tool,
        parameters: {
          booking_id: summary.booking.reference,
          task_id: summary.id,
        },
        expectedPostcondition:
          "The external system returns a reference that can be verified before the task is completed.",
        approvalRequired: summary.status === "needs_approval",
      },
      activity: refundWorkspaceFixture.activity.slice(0, 3).map((event, eventIndex) => ({
        ...event,
        id: `${summary.id}-ACT-${eventIndex + 1}`,
      })),
    });
  },
);
