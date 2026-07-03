import { z } from "zod";

export const TaskTypeSchema = z.enum([
  "refund",
  "ticket_change",
  "booking_issue",
]);

export const TaskStatusSchema = z.enum([
  "needs_approval",
  "gathering_policy",
  "needs_information",
]);

export const MoneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
});

export const TaskSummarySchema = z.object({
  id: z.string().regex(/^(RF|TC|BI)-\d{4}$/),
  type: TaskTypeSchema,
  summary: z.string().min(1),
  customer: z.object({
    name: z.string().min(1),
    isVip: z.boolean(),
  }),
  booking: z.object({
    reference: z.string().min(1),
    serviceDateLabel: z.string().min(1),
  }),
  status: TaskStatusSchema,
  dueInMinutes: z.number().int().nonnegative(),
  exposure: MoneySchema.nullable(),
});

export type TaskType = z.infer<typeof TaskTypeSchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskSummary = z.infer<typeof TaskSummarySchema>;
