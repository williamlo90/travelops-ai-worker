import { mockTaskRepository } from "@/data/tasks/mock-task-repository";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
import { notFound } from "next/navigation";

export default async function TaskWorkspacePage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const workspace = await mockTaskRepository.getTaskWorkspace(taskId);

  if (!workspace) notFound();

  return <TaskWorkspace workspace={workspace} />;
}
