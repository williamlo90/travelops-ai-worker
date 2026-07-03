"use client";

import type { AgentRun, RunEvent } from "@/domain/runs/agent-run";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleX,
  Clock3,
  Copy,
  RefreshCw,
  SearchCheck,
} from "lucide-react";
import { useState } from "react";

function duration(milliseconds: number | null) {
  if (milliseconds === null) return "—";
  if (milliseconds >= 60000) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.round((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  if (milliseconds >= 1000) return `${(milliseconds / 1000).toFixed(1)}s`;
  return `${milliseconds}ms`;
}

const eventPresentation = {
  completed: { label: "Completed", icon: CheckCircle2, className: "text-success bg-success-bg" },
  waiting: { label: "Waiting", icon: Clock3, className: "text-warning bg-warning-bg" },
  failed: { label: "Failed", icon: CircleX, className: "text-danger bg-danger-bg" },
  uncertain: { label: "Outcome uncertain", icon: AlertTriangle, className: "text-warning bg-warning-bg" },
} as const;

function EventDetails({ event }: { event: RunEvent }) {
  return (
    <div className="grid gap-4 border-t border-border bg-surface-subtle/60 px-4 py-4 sm:grid-cols-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">Safe input</p>
        <dl className="mt-2 space-y-1.5">
          {event.safeInput ? Object.entries(event.safeInput).map(([key, value]) => (
            <div key={key} className="grid grid-cols-[minmax(90px,0.7fr)_1fr] gap-3 text-xs">
              <dt className="font-mono text-muted">{key}</dt>
              <dd className="break-words text-secondary">{value}</dd>
            </div>
          )) : <p className="text-xs text-muted">No external input.</p>}
        </dl>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted">Safe output</p>
        <dl className="mt-2 space-y-1.5">
          {event.safeOutput ? Object.entries(event.safeOutput).map(([key, value]) => (
            <div key={key} className="grid grid-cols-[minmax(90px,0.7fr)_1fr] gap-3 text-xs">
              <dt className="font-mono text-muted">{key}</dt>
              <dd className="break-words text-secondary">{value}</dd>
            </div>
          )) : <p className="text-xs text-muted">No confirmed output.</p>}
        </dl>
      </div>
      {event.error ? (
        <div className="sm:col-span-2 rounded-md border border-danger/25 bg-danger-bg p-3 text-sm text-danger">
          <p className="font-semibold">What failed</p>
          <p className="mt-1 leading-5">{event.error}</p>
        </div>
      ) : null}
      <div className="sm:col-span-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted">
        <span>Attempt {event.attempt}</span>
        <span>Side effect: {event.sideEffect}</span>
        <span>Correlation: {event.correlationId}</span>
      </div>
    </div>
  );
}

export function AgentRunTimeline({ run }: { run: AgentRun }) {
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const lastEvent = run.events.at(-1);

  function startRecovery() {
    if (run.scenario === "failed") {
      setRecoveryMessage("Safe retry request recorded locally. No tool call was sent.");
    } else if (run.scenario === "uncertain") {
      setRecoveryMessage("Reconciliation request recorded locally. Retry remains blocked.");
    }
  }

  async function copyRunId() {
    await navigator.clipboard?.writeText(run.id);
    setCopied(true);
  }

  const statusClass =
    run.status === "verified"
      ? "bg-success-bg text-success"
      : run.status === "failed"
        ? "bg-danger-bg text-danger"
        : "bg-warning-bg text-warning";

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-5 lg:px-6">
      <a
        href={`/tasks/${run.taskId}`}
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        {run.taskId} Workspace
      </a>

      <header className="mt-2 border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-secondary">{run.id}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>
                {run.status === "verified"
                  ? "Verified completion"
                  : run.status === "failed"
                    ? "Failed safely"
                    : "Execution uncertain"}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">Agent Run Timeline</h1>
            <p className="mt-2 max-w-3xl text-sm text-secondary">{run.summary}</p>
          </div>
          <button
            type="button"
            onClick={copyRunId}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium hover:bg-surface-subtle"
          >
            <Copy aria-hidden="true" size={15} />
            {copied ? "Run ID copied" : "Copy run ID"}
          </button>
        </div>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <div><dt className="inline text-muted">Task </dt><dd className="inline font-semibold">{run.taskId}</dd></div>
          <div><dt className="inline text-muted">Proposal </dt><dd className="inline font-semibold">v{run.proposalVersion}</dd></div>
          <div><dt className="inline text-muted">Duration </dt><dd className="inline font-semibold">{duration(run.totalDurationMs)}</dd></div>
          <div><dt className="inline text-muted">Events </dt><dd className="inline font-semibold">{run.events.length}</dd></div>
        </dl>
      </header>

      <nav aria-label="Run scenarios" className="mt-5 flex flex-wrap gap-2">
        {(["completed", "failed", "uncertain"] as const).map((scenario) => (
          <a
            key={scenario}
            href={`/tasks/${run.taskId}/runs/${run.id}?scenario=${scenario}`}
            aria-current={run.scenario === scenario ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${
              run.scenario === scenario
                ? "border-action bg-info-bg text-info"
                : "border-border bg-surface text-secondary"
            }`}
          >
            {scenario}
          </a>
        ))}
      </nav>

      {run.scenario !== "completed" && lastEvent ? (
        <section
          aria-labelledby="recovery-heading"
          className={`mt-5 rounded-lg border p-5 ${
            run.scenario === "uncertain"
              ? "border-warning/30 bg-warning-bg"
              : "border-danger/25 bg-danger-bg"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="recovery-heading" className="font-semibold">
                {run.scenario === "uncertain"
                  ? "Do not retry: reconcile external state first"
                  : "Safe retry is allowed"}
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-5 text-secondary">
                {run.scenario === "uncertain"
                  ? "The provider may have created a refund. Search by booking and idempotency key before any second attempt."
                  : "The provider rejected the request before creating a refund. A new attempt may reuse the same idempotency key."}
              </p>
            </div>
            <button
              type="button"
              onClick={startRecovery}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white"
            >
              {run.scenario === "uncertain" ? <SearchCheck size={16} /> : <RefreshCw size={16} />}
              {run.scenario === "uncertain" ? "Start reconciliation" : "Record safe retry"}
            </button>
          </div>
          {recoveryMessage ? <p role="status" className="mt-4 text-sm font-medium">{recoveryMessage}</p> : null}
        </section>
      ) : null}

      <section aria-labelledby="events-heading" className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="events-heading" className="text-sm font-semibold">Business events</h2>
          <span className="text-xs text-muted">Raw technical spans are intentionally excluded</span>
        </div>
        <ol className="space-y-3">
          {run.events.map((event) => {
            const presentation = eventPresentation[event.status];
            const Icon = presentation.icon;
            return (
              <li key={event.id}>
                <details className="group overflow-hidden rounded-lg border border-border bg-surface">
                  <summary className="grid min-h-16 cursor-pointer list-none grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                    <span className={`grid size-8 place-items-center rounded-full ${presentation.className}`}>
                      <Icon aria-hidden="true" size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold">{event.label}</span>
                        <span className="text-[11px] font-medium text-muted">{presentation.label}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-secondary">{event.detail}</p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-xs tabular-nums text-secondary">{duration(event.durationMs)}</p>
                        <p className="mt-1 font-mono text-[10px] text-muted">{event.operation ?? "human_decision"}</p>
                      </div>
                      <ChevronDown aria-hidden="true" size={16} className="text-muted transition-transform group-open:rotate-180" />
                    </div>
                  </summary>
                  <EventDetails event={event} />
                </details>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-5 text-xs text-muted">
        Deterministic demonstration scenario. No real provider action was executed.
      </p>
    </div>
  );
}
