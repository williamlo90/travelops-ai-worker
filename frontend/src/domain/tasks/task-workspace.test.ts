import { describe, expect, it } from "vitest";
import { TaskWorkspaceSchema } from "./task-workspace";
import { refundWorkspaceFixture } from "@/mocks/fixtures/task-workspace-fixtures";

describe("TaskWorkspaceSchema", () => {
  it("validates evidence-bound proposed actions", () => {
    const result = TaskWorkspaceSchema.parse(refundWorkspaceFixture);

    expect(result.evidence).toHaveLength(2);
    expect(result.proposedAction.tool).toBe("create_refund_request");
    expect(result.proposedAction.approvalRequired).toBe(true);
  });

  it("rejects a workspace without policy evidence", () => {
    expect(() =>
      TaskWorkspaceSchema.parse({ ...refundWorkspaceFixture, evidence: [] }),
    ).toThrow();
  });
});
