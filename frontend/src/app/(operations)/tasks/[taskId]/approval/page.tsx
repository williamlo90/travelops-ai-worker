import { mockTaskRepository } from "@/data/tasks/mock-task-repository";
import { ApprovalReview } from "@/features/approvals/components/approval-review";
import { notFound } from "next/navigation";

export default async function ApprovalReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>;
  searchParams: Promise<{ scenario?: string; proposal?: string; evidence?: string }>;
}) {
  const { taskId } = await params;
  const {
    scenario: rawScenario,
    proposal = "v1",
    evidence = "v3",
  } = await searchParams;
  const workspace = await mockTaskRepository.getTaskWorkspace(taskId);
  if (!workspace) notFound();

  const versionMismatch =
    proposal !== `v${workspace.proposedAction.version}` || evidence !== "v3";
  const scenario = versionMismatch || rawScenario === "stale"
    ? "stale"
    : rawScenario === "expired"
      ? "expired"
      : "active";
  return <ApprovalReview workspace={workspace} scenario={scenario} />;
}
