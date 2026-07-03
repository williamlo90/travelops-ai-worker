import type { TaskRepository } from "./task-repository";
import { taskInboxFoundationScenario } from "@/mocks/scenarios/task-inbox-scenarios";
import { taskWorkspaceFixtures } from "@/mocks/fixtures/task-workspace-fixtures";

export const mockTaskRepository: TaskRepository = {
  async listTaskSummaries() {
    return taskInboxFoundationScenario.tasks.map((task) => ({
      ...task,
      customer: { ...task.customer },
      booking: { ...task.booking },
      exposure: task.exposure ? { ...task.exposure } : null,
    }));
  },
  async getTaskWorkspace(taskId) {
    const workspace = taskWorkspaceFixtures.find((candidate) => candidate.task.id === taskId);
    return workspace ? structuredClone(workspace) : null;
  },
};
