import { apiTaskRepository } from "./api-task-repository";
import { mockTaskRepository } from "./mock-task-repository";
import type { TaskRepository } from "./task-repository";

export function getTaskRepository(): TaskRepository {
  return process.env.TRAVELOPS_DATA_MODE === "api"
    ? apiTaskRepository
    : mockTaskRepository;
}
