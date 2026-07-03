import { describe, expect, it } from "vitest";
import { TaskSummarySchema } from "./task-summary";

const validTask = {
  id: "RF-1042",
  type: "refund",
  summary: "Flight cancelled by carrier",
  customer: { name: "Maria Santos", isVip: true },
  booking: { reference: "BA218", serviceDateLabel: "14 Jul" },
  status: "needs_approval",
  dueInMinutes: 18,
  exposure: { amount: 284, currency: "USD" },
};

describe("TaskSummarySchema", () => {
  it("accepts a valid task contract", () => {
    expect(TaskSummarySchema.parse(validTask)).toEqual(validTask);
  });

  it("rejects unknown statuses and malformed currency codes", () => {
    expect(() =>
      TaskSummarySchema.parse({
        ...validTask,
        status: "pending",
        exposure: { amount: 284, currency: "dollars" },
      }),
    ).toThrow();
  });
});
