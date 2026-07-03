import type { TaskSummary } from "@/domain/tasks/task-summary";
import type { TaskWorkspace } from "@/domain/tasks/task-workspace";

export interface TaskRepository {
  readonly source: "api" | "mock";
  listTaskSummaries(): Promise<readonly TaskSummary[]>;
  getTaskWorkspace(taskId: string): Promise<TaskWorkspace | null>;
}
