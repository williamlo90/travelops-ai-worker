import { afterEach, describe, expect, it, vi } from "vitest";
import { apiTaskRepository, TaskApiError } from "./api-task-repository";

const summary = {
  id: "RF-1042",
  type: "refund",
  summary: "Flight cancelled by carrier",
  customer: { name: "Maria Santos", is_vip: true },
  booking: { reference: "BA218", service_date_label: "14 Jul" },
  status: "needs_approval",
  due_in_minutes: 18,
  exposure: { amount: 284, currency: "USD" },
} as const;

afterEach(() => vi.unstubAllGlobals());

describe("apiTaskRepository", () => {
  it("maps the snake-case list contract into the existing domain contract", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [summary], next_cursor: null, total: 1, meta: { data_mode: "demo" },
    }), { status: 200 })));

    const tasks = await apiTaskRepository.listTaskSummaries();

    expect(tasks).toEqual([{
      id: "RF-1042",
      type: "refund",
      summary: "Flight cancelled by carrier",
      customer: { name: "Maria Santos", isVip: true },
      booking: { reference: "BA218", serviceDateLabel: "14 Jul" },
      status: "needs_approval",
      dueInMinutes: 18,
      exposure: { amount: 284, currency: "USD" },
    }]);
  });

  it("returns null only for a real API 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    await expect(apiTaskRepository.getTaskWorkspace("RF-9999")).resolves.toBeNull();
  });

  it("maps the task workspace contract including UTC timestamps", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: {
        task: summary,
        request: { received_at: "2026-07-03T09:00:00Z", channel: "email", customer_message: "Refund requested." },
        customer: { id: "CUS-1042", tier: "vip", locale: "en-SG", contact: "maria@example.com" },
        booking: { status: "cancelled", provider: "British Airways", itinerary: "SIN to LHR", passengers: 1, paid_amount: { amount: 284, currency: "USD" } },
        evidence: [{ id: "POL-1", title: "Refund Policy", clause: "4.2", excerpt: "Eligible.", effective_date: "01 Jan 2026" }],
        risks: [{ id: "RISK-1", label: "Threshold", outcome: "requires_approval", explanation: "Over threshold." }],
        recommendation: { outcome: "Refund", amount: { amount: 284, currency: "USD" }, confidence: "high", decision_summary: "Eligible refund.", uncertainty: null },
        proposed_action: { version: 1, tool: "create_refund_request", parameters: { booking_id: "BA218" }, expected_postcondition: "Refund exists.", approval_required: true },
        activity: [{ id: "ACT-1", label: "Loaded", detail: "Context loaded.", timestamp: "2026-07-03T09:00:00Z", status: "completed" }],
      },
      meta: { data_mode: "demo" },
    }), { status: 200 })));

    const workspace = await apiTaskRepository.getTaskWorkspace("RF-1042");

    expect(workspace?.booking.paidAmount.amount).toBe(284);
    expect(workspace?.request.receivedAt).toBe("2026-07-03T09:00:00Z");
    expect(workspace?.proposedAction.approvalRequired).toBe(true);
  });

  it("does not disguise backend failure as empty data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
    expect.assertions(2);
    try {
      await apiTaskRepository.listTaskSummaries();
    } catch (error) {
      expect(error).toBeInstanceOf(TaskApiError);
      expect((error as TaskApiError).status).toBe(503);
    }
  });
});
