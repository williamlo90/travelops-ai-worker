import type { TaskStatus } from "@/domain/tasks/task-summary";

const statusPresentation: Record<
  TaskStatus,
  { label: string; className: string }
> = {
  needs_approval: {
    label: "Needs approval",
    className: "bg-warning-bg font-semibold text-warning ring-1 ring-warning/15",
  },
  gathering_policy: {
    label: "Gathering policy",
    className: "bg-info-bg text-info",
  },
  needs_information: {
    label: "Needs information",
    className: "bg-neutral-bg text-neutral",
  },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const presentation = statusPresentation[status];

  return (
    <span
      className={`inline-flex min-h-6 items-center rounded px-2 py-1 text-xs font-medium ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}
