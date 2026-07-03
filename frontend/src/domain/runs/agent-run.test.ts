import { describe, expect, it } from "vitest";
import { AgentRunSchema } from "./agent-run";
import {
  completedRunFixture,
  failedRunFixture,
  uncertainRunFixture,
} from "@/mocks/fixtures/agent-run-fixtures";

describe("AgentRunSchema", () => {
  it("requires verified completion to include a confirmed postcondition event", () => {
    const run = AgentRunSchema.parse(completedRunFixture);
    expect(run.status).toBe("verified");
    expect(run.events.at(-1)).toMatchObject({
      label: "External result verified",
      sideEffect: "confirmed",
    });
  });

  it("distinguishes safe failure from uncertain execution", () => {
    expect(failedRunFixture.events.at(-1)).toMatchObject({
      status: "failed",
      sideEffect: "none",
      recovery: "safe_retry",
    });
    expect(uncertainRunFixture.events.at(-1)).toMatchObject({
      status: "uncertain",
      sideEffect: "possible",
      recovery: "reconcile",
    });
  });
});
