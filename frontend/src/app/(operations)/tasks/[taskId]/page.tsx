import { getTaskRepository } from "@/data/tasks/task-repository-provider";
import { TaskWorkspace } from "@/features/tasks/components/task-workspace";
import { notFound } from "next/navigation";

export default async function TaskWorkspacePage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const workspace = await getTaskRepository().getTaskWorkspace(taskId);

  if (!workspace) notFound();

  return <TaskWorkspace workspace={workspace} />;
}
