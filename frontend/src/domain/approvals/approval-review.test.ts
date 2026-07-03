import { describe, expect, it } from "vitest";
import {
  submitMockApprovalDecision,
  type ApprovalReviewState,
} from "./approval-review";

const pending: ApprovalReviewState = {
  proposalVersion: 1,
  evidenceVersion: 3,
  reservation: {
    status: "active",
    reviewer: "A. Rahman",
    expiresAt: "2026-07-03T09:30:00.000Z",
  },
  status: "pending",
  decision: null,
};

describe("submitMockApprovalDecision", () => {
  it("binds an attributable decision to proposal and evidence versions", () => {
    const result = submitMockApprovalDecision(pending, {
      outcome: "approved",
      reason: "Policy requires supervisor review.",
      expectedProposalVersion: 1,
      expectedEvidenceVersion: 3,
      decidedAt: "2026-07-03T09:20:00.000Z",
    });

    expect(result.status).toBe("approved");
    expect(result.decision).toMatchObject({
      reviewer: "A. Rahman",
      proposalVersion: 1,
      evidenceVersion: 3,
    });
  });

  it("blocks stale and expired decisions", () => {
    expect(() =>
      submitMockApprovalDecision(pending, {
        outcome: "rejected",
        reason: "Evidence no longer supports this.",
        expectedProposalVersion: 2,
        expectedEvidenceVersion: 3,
        decidedAt: "2026-07-03T09:20:00.000Z",
      }),
    ).toThrow("stale");

    expect(() =>
      submitMockApprovalDecision(
        { ...pending, reservation: { ...pending.reservation, status: "expired" } },
        {
          outcome: "rejected",
          reason: "Reservation must be renewed first.",
          expectedProposalVersion: 1,
          expectedEvidenceVersion: 3,
          decidedAt: "2026-07-03T09:20:00.000Z",
        },
      ),
    ).toThrow("expired");
  });
});
