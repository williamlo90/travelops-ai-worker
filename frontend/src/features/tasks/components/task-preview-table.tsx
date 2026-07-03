"use client";

import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/travelops/status-badge";
import type { TaskSummary, TaskType } from "@/domain/tasks/task-summary";
import type { ColumnDef } from "@tanstack/react-table";

const taskTypeLabels: Record<TaskType, string> = {
  refund: "Refund",
  ticket_change: "Ticket change",
  booking_issue: "Booking issue",
};

function formatDueTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount);
}

const columns: ColumnDef<TaskSummary>[] = [
  {
    id: "task",
    header: "Task",
    size: 320,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-secondary">{row.original.id}</span>
          <span className="text-xs text-muted">{taskTypeLabels[row.original.type]}</span>
        </div>
        <a
          href={`/tasks/${row.original.id}`}
          onClick={(event) => event.stopPropagation()}
          className="mt-1 block truncate text-sm font-medium text-primary hover:text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {row.original.summary}
        </a>
      </div>
    ),
  },
  {
    id: "customer",
    header: "Customer & booking",
    size: 220,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate text-sm text-primary">
          {row.original.customer.name}
          {row.original.customer.isVip ? (
            <span className="ml-2 rounded bg-warning-bg px-1.5 py-0.5 text-[10px] font-semibold text-warning">VIP</span>
          ) : null}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {row.original.booking.reference} · {row.original.booking.serviceDateLabel}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 170,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "dueInMinutes",
    header: "SLA",
    size: 100,
    cell: ({ row }) => (
      <span className={`text-sm font-medium tabular-nums ${row.original.dueInMinutes < 30 ? "text-warning" : "text-secondary"}`}>
        {formatDueTime(row.original.dueInMinutes)}
      </span>
    ),
  },
  {
    accessorKey: "exposure",
    header: "Exposure",
    size: 110,
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums text-primary">
        {row.original.exposure
          ? formatMoney(
              row.original.exposure.amount,
              row.original.exposure.currency,
            )
          : "—"}
      </span>
    ),
  },
];

export function TaskPreviewTable({
  tasks,
  selectedTaskId,
  onTaskSelect,
  onTaskOpen,
}: {
  tasks: readonly TaskSummary[];
  selectedTaskId?: string;
  onTaskSelect?: (task: TaskSummary) => void;
  onTaskOpen?: (task: TaskSummary) => void;
}) {
  return (
    <DataTable
      columns={columns}
      data={tasks}
      getRowId={(task) => task.id}
      caption="Static preview of TravelOps tasks"
      selectedRowId={selectedTaskId}
      onRowSelect={onTaskSelect}
      onRowOpen={onTaskOpen}
    />
  );
}
