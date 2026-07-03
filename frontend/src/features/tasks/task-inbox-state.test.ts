import { describe, expect, it } from "vitest";
import { foundationTaskFixtures } from "@/mocks/fixtures/task-summary-fixtures";
import {
  defaultTaskInboxState,
  parseTaskInboxState,
  selectTaskInboxRows,
  updateTaskInboxSearchParams,
} from "./task-inbox-state";

describe("Task Inbox URL state", () => {
  it("falls back safely when URL values are unsupported", () => {
    const state = parseTaskInboxState(
      new URLSearchParams("status=pending&type=unknown&sort=random"),
    );
    expect(state).toEqual(defaultTaskInboxState);
  });

  it("keeps non-inbox params and removes default inbox values", () => {
    const params = updateTaskInboxSearchParams(
      new URLSearchParams("source=demo&view=vip"),
      { view: "all", query: "Maria" },
    );
    expect(params.toString()).toBe("source=demo&q=Maria");
  });
});

describe("Task Inbox row selection", () => {
  it("searches identifiers, customers, bookings, and summaries", () => {
    for (const query of ["RF-1042", "Maria", "BA218", "cancelled"]) {
      const rows = selectTaskInboxRows(foundationTaskFixtures, {
        ...defaultTaskInboxState,
        query,
      });
      expect(rows.map((task) => task.id)).toContain("RF-1042");
    }
  });

  it("combines saved view, status, and deterministic exposure sorting", () => {
    const rows = selectTaskInboxRows(foundationTaskFixtures, {
      ...defaultTaskInboxState,
      status: "needs_approval",
      view: "high_exposure",
      sort: "exposure_desc",
    });
    expect(rows.map((task) => task.id)).toEqual(["RF-1026", "RF-1014"]);
  });
});
