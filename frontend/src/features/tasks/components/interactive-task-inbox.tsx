"use client";

import { InlineBanner } from "@/components/ui/inline-banner";
import type { TaskSummary } from "@/domain/tasks/task-summary";
import {
  defaultTaskInboxState,
  hasActiveTaskInboxFilters,
  parseTaskInboxState,
  selectTaskInboxRows,
  updateTaskInboxSearchParams,
  type TaskInboxSort,
  type TaskInboxState,
  type TaskInboxView,
} from "@/features/tasks/task-inbox-state";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TaskPreviewTable } from "./task-preview-table";

type InteractiveTaskInboxProps = {
  tasks: readonly TaskSummary[];
  scenarioLabel: string;
  openTaskCount: number;
};

const controlClassName =
  "h-9 rounded-md border border-border bg-surface px-3 text-sm text-secondary outline-none transition-colors hover:border-muted focus-visible:border-info focus-visible:ring-2 focus-visible:ring-focus";

export function InteractiveTaskInbox({
  tasks,
  scenarioLabel,
  openTaskCount,
}: InteractiveTaskInboxProps) {
  const [state, setState] = useState(defaultTaskInboxState);
  const interactiveRegionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function restoreStateFromUrl() {
      setState(parseTaskInboxState(new URLSearchParams(window.location.search)));
    }

    restoreStateFromUrl();
    interactiveRegionRef.current?.setAttribute("data-interactive-ready", "true");
    window.addEventListener("popstate", restoreStateFromUrl);
    return () => window.removeEventListener("popstate", restoreStateFromUrl);
  }, []);
  const rows = useMemo(() => selectTaskInboxRows(tasks, state), [tasks, state]);
  const selectedTask = tasks.find((task) => task.id === state.selectedTaskId);

  function updateState(
    patch: Partial<TaskInboxState>,
    history: "replace" | "push" = "replace",
  ) {
    const next = updateTaskInboxSearchParams(
      new URLSearchParams(window.location.search),
      patch,
    );
    const nextState = parseTaskInboxState(next);
    const query = next.toString();
    const destination = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
    window.history[`${history}State`](null, "", destination);
    setState(nextState);
  }

  function clearFilters() {
    updateState({
      query: defaultTaskInboxState.query,
      status: defaultTaskInboxState.status,
      type: defaultTaskInboxState.type,
      view: defaultTaskInboxState.view,
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-5 lg:px-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.025em]">Task Inbox</h1>
          <p className="mt-1 text-sm text-secondary">
            Prioritize travel requests that need operator attention.
          </p>
          <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted">Open</dt>
              <dd className="font-semibold tabular-nums text-primary">{openTaskCount}</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted">Urgent</dt>
              <dd className="font-semibold tabular-nums text-warning">8</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted">Average SLA</dt>
              <dd className="font-semibold tabular-nums text-primary">41 min</dd>
            </div>
          </dl>
        </div>
        <InlineBanner>{scenarioLabel}</InlineBanner>
      </div>

      <section
        ref={interactiveRegionRef}
        aria-labelledby="queue-heading"
        className="pt-5"
        data-interactive-ready="false"
      >
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex min-w-fit items-center gap-2">
            <h2 id="queue-heading" className="text-sm font-semibold">My queue</h2>
            <span className="text-xs tabular-nums text-muted">
              {rows.length} of {tasks.length} preview records
            </span>
          </div>

          <div
            role="toolbar"
            aria-label="Task queue controls"
            className="grid gap-2 lg:grid-cols-[minmax(280px,1fr)_auto] lg:items-center"
          >
            <label className="relative min-w-0">
              <span className="sr-only">Search tasks</span>
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                value={state.query}
                onChange={(event) => updateState({ query: event.target.value })}
                placeholder="Search booking ID, customer or task..."
                className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary outline-none placeholder:text-muted focus-visible:border-info focus-visible:ring-2 focus-visible:ring-focus"
              />
            </label>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <div
                role="group"
                aria-label="Filter tasks"
                className="flex flex-wrap items-center gap-2"
              >
                <label>
                  <span className="sr-only">Filter by task status</span>
                  <select
                    value={state.status}
                    onChange={(event) => updateState({ status: event.target.value as TaskInboxState["status"] })}
                    className={controlClassName}
                  >
                    <option value="all">All statuses</option>
                    <option value="needs_approval">Needs approval</option>
                    <option value="gathering_policy">Gathering policy</option>
                    <option value="needs_information">Needs information</option>
                  </select>
                </label>

                <label>
                  <span className="sr-only">Filter by task type</span>
                  <select
                    value={state.type}
                    onChange={(event) => updateState({ type: event.target.value as TaskInboxState["type"] })}
                    className={controlClassName}
                  >
                    <option value="all">All types</option>
                    <option value="refund">Refund</option>
                    <option value="ticket_change">Ticket change</option>
                    <option value="booking_issue">Booking issue</option>
                  </select>
                </label>

                <label>
                  <span className="sr-only">Apply an operational view</span>
                  <select
                    value={state.view}
                    onChange={(event) => updateState({ view: event.target.value as TaskInboxView })}
                    className={controlClassName}
                  >
                    <option value="all">All views</option>
                    <option value="vip">VIP</option>
                    <option value="urgent">Urgent</option>
                    <option value="high_exposure">High exposure</option>
                  </select>
                </label>
              </div>

              <div
                role="group"
                aria-label="Task ordering controls"
                className="flex items-center gap-2 border-l border-border pl-2"
              >
                <label>
                  <span className="sr-only">Sort tasks</span>
                  <select
                    value={state.sort}
                    onChange={(event) => updateState({ sort: event.target.value as TaskInboxSort })}
                    className={controlClassName}
                  >
                    <option value="priority">Priority</option>
                    <option value="sla_asc">SLA: soonest</option>
                    <option value="exposure_desc">Exposure: highest</option>
                  </select>
                </label>

                {hasActiveTaskInboxFilters(state) ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-secondary hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <X aria-hidden="true" size={15} />
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {rows.length} tasks shown
        </p>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          {rows.length ? (
            <TaskPreviewTable
              tasks={rows}
              selectedTaskId={state.selectedTaskId}
              onTaskSelect={(task) => {
                if (task.id !== state.selectedTaskId) {
                  updateState({ selectedTaskId: task.id }, "push");
                }
              }}
              onTaskOpen={(task) => window.location.assign(`/tasks/${task.id}`)}
            />
          ) : (
            <div className="grid min-h-[360px] place-items-center px-6 text-center">
              <div>
                <p className="text-sm font-semibold text-primary">No tasks match this view</p>
                <p className="mt-1 text-sm text-secondary">
                  Change the search or clear filters to return to the queue.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-primary hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}

          <div className="flex min-h-11 flex-col justify-center gap-1 border-t border-border bg-surface-subtle/60 px-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>{rows.length} task{rows.length === 1 ? "" : "s"} shown</span>
            <span>
              {selectedTask
                ? `${selectedTask.id} selected · Workspace planned for Sprint 4`
                : "Select a row · Use Arrow keys to move through the queue"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
