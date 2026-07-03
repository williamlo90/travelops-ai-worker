import { TaskSummarySchema, type TaskSummary } from "@/domain/tasks/task-summary";
import { TaskWorkspaceSchema, type TaskWorkspace } from "@/domain/tasks/task-workspace";
import { z } from "zod";
import type { TaskRepository } from "./task-repository";

const apiTaskSummarySchema = z.object({
  id: z.string(),
  type: z.enum(["refund", "ticket_change", "booking_issue"]),
  summary: z.string(),
  customer: z.object({ name: z.string(), is_vip: z.boolean() }),
  booking: z.object({ reference: z.string(), service_date_label: z.string() }),
  status: z.enum(["needs_approval", "gathering_policy", "needs_information"]),
  due_in_minutes: z.number().int().nonnegative(),
  exposure: z.object({ amount: z.number(), currency: z.string() }).nullable(),
});

const taskListEnvelopeSchema = z.object({
  items: apiTaskSummarySchema.array(),
  next_cursor: z.string().nullable(),
  total: z.number().int().nonnegative(),
  meta: z.object({ data_mode: z.literal("demo") }),
});

const taskDetailEnvelopeSchema = z.object({
  data: z.object({
    task: apiTaskSummarySchema,
    request: z.object({
      received_at: z.string(),
      channel: z.enum(["email", "chat", "phone"]),
      customer_message: z.string(),
    }),
    customer: z.object({
      id: z.string(),
      tier: z.enum(["standard", "vip"]),
      locale: z.string(),
      contact: z.string(),
    }),
    booking: z.object({
      status: z.enum(["confirmed", "cancelled", "failed"]),
      provider: z.string(),
      itinerary: z.string(),
      passengers: z.number().int().positive(),
      paid_amount: z.object({ amount: z.number(), currency: z.string() }),
    }),
    evidence: z.array(z.object({
      id: z.string(), title: z.string(), clause: z.string(), excerpt: z.string(), effective_date: z.string(),
    })),
    risks: z.array(z.object({
      id: z.string(), label: z.string(), outcome: z.enum(["passed", "requires_approval", "needs_information"]), explanation: z.string(),
    })),
    recommendation: z.object({
      outcome: z.string(),
      amount: z.object({ amount: z.number(), currency: z.string() }).nullable(),
      confidence: z.enum(["high", "medium", "low"]),
      decision_summary: z.string(),
      uncertainty: z.string().nullable(),
    }),
    proposed_action: z.object({
      version: z.number().int().positive(),
      tool: z.string(),
      parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
      expected_postcondition: z.string(),
      approval_required: z.boolean(),
    }),
    activity: z.array(z.object({
      id: z.string(), label: z.string(), detail: z.string(), timestamp: z.string(), status: z.enum(["completed", "current", "waiting"]),
    })),
  }),
  meta: z.object({ data_mode: z.literal("demo") }),
});

export class TaskApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function mapSummary(raw: z.infer<typeof apiTaskSummarySchema>): TaskSummary {
  return TaskSummarySchema.parse({
    ...raw,
    customer: { name: raw.customer.name, isVip: raw.customer.is_vip },
    booking: {
      reference: raw.booking.reference,
      serviceDateLabel: raw.booking.service_date_label,
    },
    dueInMinutes: raw.due_in_minutes,
  });
}

async function request(path: string): Promise<Response> {
  const baseUrl = process.env.TRAVELOPS_API_INTERNAL_URL ?? "http://127.0.0.1:8000";
  return fetch(`${baseUrl}${path}`, { cache: "no-store" });
}

export const apiTaskRepository: TaskRepository = {
  source: "api",
  async listTaskSummaries() {
    const response = await request("/api/tasks?limit=100");
    if (!response.ok) throw new TaskApiError("Task API is unavailable.", response.status);
    const envelope = taskListEnvelopeSchema.parse(await response.json());
    return envelope.items.map(mapSummary);
  },
  async getTaskWorkspace(taskId) {
    const response = await request(`/api/tasks/${encodeURIComponent(taskId)}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new TaskApiError("Task API is unavailable.", response.status);
    const { data } = taskDetailEnvelopeSchema.parse(await response.json());
    return TaskWorkspaceSchema.parse({
      task: mapSummary(data.task),
      request: {
        receivedAt: data.request.received_at,
        channel: data.request.channel,
        customerMessage: data.request.customer_message,
      },
      customer: data.customer,
      booking: {
        ...data.booking,
        paidAmount: data.booking.paid_amount,
      },
      evidence: data.evidence.map((item) => ({ ...item, effectiveDate: item.effective_date })),
      risks: data.risks,
      recommendation: {
        ...data.recommendation,
        decisionSummary: data.recommendation.decision_summary,
      },
      proposedAction: {
        version: data.proposed_action.version,
        tool: data.proposed_action.tool,
        parameters: data.proposed_action.parameters,
        expectedPostcondition: data.proposed_action.expected_postcondition,
        approvalRequired: data.proposed_action.approval_required,
      },
      activity: data.activity,
    } satisfies TaskWorkspace);
  },
};
