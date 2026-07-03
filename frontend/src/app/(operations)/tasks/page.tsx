import { getTaskRepository } from "@/data/tasks/task-repository-provider";
import { InteractiveTaskInbox } from "@/features/tasks/components/interactive-task-inbox";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Inbox",
};

export const dynamic = "force-dynamic";

export default async function TaskInboxPage() {
  const repository = getTaskRepository();
  const tasks = await repository.listTaskSummaries();

  return (
    <InteractiveTaskInbox
      tasks={tasks}
      scenarioLabel={repository.source === "api" ? "API-backed demo data" : "Static demo data"}
      openTaskCount={tasks.length}
    />
  );
}
