import { describe, expect, it } from "vitest";
import {
  evaluatedDatasetFixture,
  goldenDatasetFixture,
  observedWorkflowOutputFixture,
} from "@/mocks/fixtures/evaluation-fixtures";
import { evaluateDataset } from "./evaluation";

describe("deterministic evaluation", () => {
  it("joins separate golden expectations and observed workflow output", () => {
    const result = evaluateDataset(
      goldenDatasetFixture,
      observedWorkflowOutputFixture,
    );

    expect(result.goldenVersion).toBe("travelops-refund-v1.0");
    expect(result.observedVersion).toBe("workflow-output-v1");
    expect(result.summary).toEqual({
      total: 6,
      passed: 5,
      failed: 1,
      passRate: 83,
    });
  });

  it("detects the known citation-applicability regression", () => {
    const knownFailure = evaluatedDatasetFixture.cases.find(
      (item) => item.id === "EVAL-006",
    );

    expect(knownFailure?.result).toBe("failed");
    expect(knownFailure?.failedChecks).toEqual([
      "decision_match",
      "citationValid",
      "approvalCompliant",
      "toolChoiceCorrect",
      "recoveryCorrect",
    ]);
    expect(knownFailure?.safetyDisposition).toContain("no external action");
  });

  it("fails when an observed result is missing", () => {
    const incompleteOutput = {
      ...observedWorkflowOutputFixture,
      results: observedWorkflowOutputFixture.results.slice(0, -1),
    };

    expect(() =>
      evaluateDataset(goldenDatasetFixture, incompleteOutput),
    ).toThrow("Missing observed result for EVAL-006");
  });
});
