import { AgentRunTimeline } from "@/features/runs/components/agent-run-timeline";
import { runFixtures } from "@/mocks/fixtures/agent-run-fixtures";
import { notFound } from "next/navigation";

export default async function AgentRunPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string; runId: string }>;
  searchParams: Promise<{ scenario?: string }>;
}) {
  const { taskId, runId } = await params;
  const { scenario: rawScenario } = await searchParams;
  if (taskId !== "RF-1042" || runId !== "AR-8821") notFound();
  const scenario =
    rawScenario === "failed" || rawScenario === "uncertain" ? rawScenario : "completed";
  return <AgentRunTimeline run={runFixtures[scenario]} />;
}
