import { z } from "zod";

export const RunEventStatusSchema = z.enum([
  "completed",
  "waiting",
  "failed",
  "uncertain",
]);

export const SideEffectStateSchema = z.enum([
  "none",
  "possible",
  "confirmed",
]);

export const RecoveryModeSchema = z.enum([
  "none",
  "safe_retry",
  "reconcile",
  "escalate",
]);

export const RunEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.string().datetime(),
  label: z.string().min(1),
  detail: z.string().min(1),
  operation: z.string().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
  status: RunEventStatusSchema,
  attempt: z.number().int().positive(),
  sideEffect: SideEffectStateSchema,
  recovery: RecoveryModeSchema,
  safeInput: z.record(z.string(), z.string()).nullable(),
  safeOutput: z.record(z.string(), z.string()).nullable(),
  error: z.string().nullable(),
  correlationId: z.string().min(1),
});

export const AgentRunSchema = z.object({
  id: z.string().regex(/^AR-\d{4}$/),
  taskId: z.string().min(1),
  proposalVersion: z.number().int().positive(),
  scenario: z.enum(["completed", "failed", "uncertain"]),
  status: z.enum(["verified", "failed", "execution_uncertain"]),
  summary: z.string().min(1),
  startedAt: z.string().datetime(),
  totalDurationMs: z.number().int().nonnegative(),
  correlationId: z.string().min(1),
  events: RunEventSchema.array().min(1),
});

export type AgentRun = z.infer<typeof AgentRunSchema>;
export type RunEvent = z.infer<typeof RunEventSchema>;
