import { MoneySchema, TaskSummarySchema } from "@/domain/tasks/task-summary";
import { z } from "zod";

export const PolicyEvidenceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  clause: z.string().min(1),
  excerpt: z.string().min(1),
  effectiveDate: z.string().min(1),
});

export const RiskCheckSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  outcome: z.enum(["passed", "requires_approval", "needs_information"]),
  explanation: z.string().min(1),
});

export const TaskWorkspaceSchema = z.object({
  task: TaskSummarySchema,
  request: z.object({
    receivedAt: z.string().datetime(),
    channel: z.enum(["email", "chat", "phone"]),
    customerMessage: z.string().min(1),
  }),
  customer: z.object({
    id: z.string().min(1),
    tier: z.enum(["standard", "vip"]),
    locale: z.string().min(1),
    contact: z.string().email(),
  }),
  booking: z.object({
    status: z.enum(["confirmed", "cancelled", "failed"]),
    provider: z.string().min(1),
    itinerary: z.string().min(1),
    passengers: z.number().int().positive(),
    paidAmount: MoneySchema,
  }),
  evidence: PolicyEvidenceSchema.array().min(1),
  risks: RiskCheckSchema.array().min(1),
  recommendation: z.object({
    outcome: z.string().min(1),
    amount: MoneySchema.nullable(),
    confidence: z.enum(["high", "medium", "low"]),
    decisionSummary: z.string().min(1),
    uncertainty: z.string().nullable(),
  }),
  proposedAction: z.object({
    version: z.number().int().positive(),
    tool: z.string().min(1),
    parameters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    expectedPostcondition: z.string().min(1),
    approvalRequired: z.boolean(),
  }),
  activity: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      detail: z.string().min(1),
      timestamp: z.string().datetime(),
      status: z.enum(["completed", "current", "waiting"]),
    }),
  ),
});

export type TaskWorkspace = z.infer<typeof TaskWorkspaceSchema>;
