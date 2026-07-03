import type { TaskStatus, TaskSummary, TaskType } from "@/domain/tasks/task-summary";
import { z } from "zod";

export const TaskInboxViewSchema = z.enum(["all", "vip", "urgent", "high_exposure"]);
export const TaskInboxSortSchema = z.enum(["priority", "sla_asc", "exposure_desc"]);

const TaskInboxStateSchema = z.object({
  query: z.string().trim().max(80).catch(""),
  status: z.enum(["all", "needs_approval", "gathering_policy", "needs_information"]).catch("all"),
  type: z.enum(["all", "refund", "ticket_change", "booking_issue"]).catch("all"),
  view: TaskInboxViewSchema.catch("all"),
  sort: TaskInboxSortSchema.catch("priority"),
  selectedTaskId: z.string().trim().max(40).catch(""),
});

export type TaskInboxState = z.infer<typeof TaskInboxStateSchema>;
export type TaskInboxView = z.infer<typeof TaskInboxViewSchema>;
export type TaskInboxSort = z.infer<typeof TaskInboxSortSchema>;

export const defaultTaskInboxState: TaskInboxState = {
  query: "",
  status: "all",
  type: "all",
  view: "all",
  sort: "priority",
  selectedTaskId: "",
};

export function parseTaskInboxState(searchParams: URLSearchParams): TaskInboxState {
  return TaskInboxStateSchema.parse({
    query: searchParams.get("q") ?? "",
    status: searchParams.get("status") ?? "all",
    type: searchParams.get("type") ?? "all",
    view: searchParams.get("view") ?? "all",
    sort: searchParams.get("sort") ?? "priority",
    selectedTaskId: searchParams.get("task") ?? "",
  });
}

export function updateTaskInboxSearchParams(
  current: URLSearchParams,
  patch: Partial<TaskInboxState>,
) {
  const next = new URLSearchParams(current);
  const state = { ...parseTaskInboxState(current), ...patch };
  const entries: Array<[keyof TaskInboxState, string, string]> = [
    ["query", "q", ""],
    ["status", "status", "all"],
    ["type", "type", "all"],
    ["view", "view", "all"],
    ["sort", "sort", "priority"],
    ["selectedTaskId", "task", ""],
  ];

  for (const [stateKey, paramKey, defaultValue] of entries) {
    const value = state[stateKey];
    if (value === defaultValue) next.delete(paramKey);
    else next.set(paramKey, value);
  }

  return next;
}

function matchesQuery(task: TaskSummary, query: string) {
  if (!query) return true;
  const haystack = [
    task.id,
    task.summary,
    task.customer.name,
    task.booking.reference,
  ]
    .join(" ")
    .toLocaleLowerCase();
  return haystack.includes(query.toLocaleLowerCase());
}

function matchesView(task: TaskSummary, view: TaskInboxView) {
  if (view === "vip") return task.customer.isVip;
  if (view === "urgent") return task.dueInMinutes < 30;
  if (view === "high_exposure") return (task.exposure?.amount ?? 0) >= 300;
  return true;
}

const statusPriority: Record<TaskStatus, number> = {
  needs_approval: 0,
  needs_information: 1,
  gathering_policy: 2,
};

export function selectTaskInboxRows(
  tasks: readonly TaskSummary[],
  state: TaskInboxState,
) {
  const rows = tasks.filter(
    (task) =>
      matchesQuery(task, state.query) &&
      (state.status === "all" || task.status === state.status) &&
      (state.type === "all" || task.type === state.type) &&
      matchesView(task, state.view),
  );

  return [...rows].sort((left, right) => {
    if (state.sort === "sla_asc") return left.dueInMinutes - right.dueInMinutes;
    if (state.sort === "exposure_desc") {
      return (right.exposure?.amount ?? -1) - (left.exposure?.amount ?? -1);
    }
    return (
      statusPriority[left.status] - statusPriority[right.status] ||
      left.dueInMinutes - right.dueInMinutes
    );
  });
}

export function hasActiveTaskInboxFilters(state: TaskInboxState) {
  return Boolean(
    state.query ||
      state.status !== "all" ||
      state.type !== "all" ||
      state.view !== "all",
  );
}

export function taskStatusLabel(status: TaskStatus | "all") {
  const labels: Record<TaskStatus | "all", string> = {
    all: "All statuses",
    needs_approval: "Needs approval",
    gathering_policy: "Gathering policy",
    needs_information: "Needs information",
  };
  return labels[status];
}

export function taskTypeLabel(type: TaskType | "all") {
  const labels: Record<TaskType | "all", string> = {
    all: "All task types",
    refund: "Refund",
    ticket_change: "Ticket change",
    booking_issue: "Booking issue",
  };
  return labels[type];
}
