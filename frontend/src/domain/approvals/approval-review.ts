import { z } from "zod";

export const ApprovalDecisionSchema = z.enum([
  "approved",
  "rejected",
  "needs_information",
]);

export const ApprovalReviewStateSchema = z.object({
  proposalVersion: z.number().int().positive(),
  evidenceVersion: z.number().int().positive(),
  reservation: z.object({
    status: z.enum(["active", "expired"]),
    reviewer: z.string().min(1),
    expiresAt: z.string().datetime(),
  }),
  status: z.enum(["pending", "approved", "rejected", "needs_information", "stale"]),
  decision: z
    .object({
      outcome: ApprovalDecisionSchema,
      reason: z.string().min(8),
      reviewer: z.string().min(1),
      proposalVersion: z.number().int().positive(),
      evidenceVersion: z.number().int().positive(),
      decidedAt: z.string().datetime(),
    })
    .nullable(),
});

export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
export type ApprovalReviewState = z.infer<typeof ApprovalReviewStateSchema>;

export function submitMockApprovalDecision(
  state: ApprovalReviewState,
  command: {
    outcome: ApprovalDecision;
    reason: string;
    expectedProposalVersion: number;
    expectedEvidenceVersion: number;
    decidedAt: string;
  },
): ApprovalReviewState {
  if (state.status !== "pending") throw new Error("Approval is no longer pending.");
  if (state.reservation.status !== "active") throw new Error("Reservation has expired.");
  if (
    state.proposalVersion !== command.expectedProposalVersion ||
    state.evidenceVersion !== command.expectedEvidenceVersion
  ) {
    throw new Error("Proposal or evidence version is stale.");
  }
  if (command.reason.trim().length < 8) {
    throw new Error("Provide a decision reason of at least 8 characters.");
  }

  return ApprovalReviewStateSchema.parse({
    ...state,
    status: command.outcome,
    decision: {
      outcome: command.outcome,
      reason: command.reason.trim(),
      reviewer: state.reservation.reviewer,
      proposalVersion: state.proposalVersion,
      evidenceVersion: state.evidenceVersion,
      decidedAt: command.decidedAt,
    },
  });
}
