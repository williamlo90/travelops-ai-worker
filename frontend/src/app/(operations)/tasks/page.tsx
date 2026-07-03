import { mockTaskRepository } from "@/data/tasks/mock-task-repository";
import { InteractiveTaskInbox } from "@/features/tasks/components/interactive-task-inbox";
import { taskInboxFoundationScenario } from "@/mocks/scenarios/task-inbox-scenarios";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task Inbox",
};

export default async function TaskInboxPage() {
  const tasks = await mockTaskRepository.listTaskSummaries();

  return (
    <InteractiveTaskInbox
      tasks={tasks}
      scenarioLabel={taskInboxFoundationScenario.label}
      openTaskCount={taskInboxFoundationScenario.openTaskCount}
    />
  );
}
