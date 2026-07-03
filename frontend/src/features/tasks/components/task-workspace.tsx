import { StatusBadge } from "@/components/travelops/status-badge";
import type { TaskWorkspace as TaskWorkspaceModel } from "@/domain/tasks/task-workspace";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { MobileTaskContext } from "./mobile-task-context";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

const riskPresentation = {
  passed: {
    label: "Passed",
    icon: CheckCircle2,
    className: "bg-success-bg text-success",
  },
  requires_approval: {
    label: "Approval required",
    icon: ShieldAlert,
    className: "bg-warning-bg text-warning",
  },
  needs_information: {
    label: "Information needed",
    icon: AlertTriangle,
    className: "bg-danger-bg text-danger",
  },
} as const;

const taskTypeLabels = {
  refund: "Refund request",
  ticket_change: "Ticket change",
  booking_issue: "Booking issue",
} as const;

export function TaskWorkspace({ workspace }: { workspace: TaskWorkspaceModel }) {
  const { task } = workspace;
  const amount = workspace.recommendation.amount;

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-5 lg:px-6">
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href={`/tasks?task=${task.id}`}
          className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Task Inbox
        </Link>
      </nav>

      <header className="border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-secondary">{task.id}</span>
              <StatusBadge status={task.status} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
                <Clock3 aria-hidden="true" size={13} />
                Due in {task.dueInMinutes} min
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
              {taskTypeLabels[task.type]} · {task.summary}
            </h1>
            <p className="mt-2 text-sm text-secondary">
              {task.customer.name} · {task.booking.reference} ·{" "}
              {task.exposure
                ? formatMoney(task.exposure.amount, task.exposure.currency)
                : "No monetary exposure"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled
              title="Escalation mutation is introduced with approval controls in Sprint 5"
              className="inline-flex min-h-10 cursor-not-allowed items-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-muted opacity-70"
            >
              Escalate
            </button>
            <a
              href={`/tasks/${task.id}/approval?proposal=v${workspace.proposedAction.version}&evidence=v3`}
              className="inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
            >
              Review proposed action
            </a>
          </div>
        </div>
      </header>

      <MobileTaskContext workspace={workspace} />

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="space-y-5">
          <section aria-labelledby="request-heading" className="rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="request-heading" className="text-sm font-semibold">Customer request</h2>
              <span className="text-xs text-muted">
                {workspace.request.channel} · {formatDateTime(workspace.request.receivedAt)}
              </span>
            </div>
            <blockquote className="mt-4 border-l-2 border-info pl-4 text-[15px] leading-6 text-primary">
              “{workspace.request.customerMessage}”
            </blockquote>
          </section>

          <section aria-labelledby="recommendation-heading" className="rounded-lg border border-border bg-surface">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Sparkles aria-hidden="true" size={17} className="text-ai" />
              <h2 id="recommendation-heading" className="text-sm font-semibold">
                Recommended resolution
              </h2>
              <span className="ml-auto rounded-full bg-ai-bg px-2.5 py-1 text-xs font-semibold text-ai">
                {workspace.recommendation.confidence} confidence
              </span>
            </div>
            <div className="p-5">
              <p className="text-lg font-semibold text-primary">
                {workspace.recommendation.outcome}
                {amount ? ` · ${formatMoney(amount.amount, amount.currency)}` : ""}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-secondary">
                {workspace.recommendation.decisionSummary}
              </p>
              {workspace.recommendation.uncertainty ? (
                <div className="mt-4 rounded-md bg-warning-bg px-3 py-2 text-sm text-warning">
                  Uncertainty: {workspace.recommendation.uncertainty}
                </div>
              ) : (
                <p className="mt-4 text-xs text-muted">
                  No unresolved evidence conflict was detected in this proposal.
                </p>
              )}
            </div>
          </section>

          <section
            id="proposed-action"
            aria-labelledby="action-heading"
            className="rounded-lg border border-border bg-surface"
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-4">
              <FileCheck2 aria-hidden="true" size={17} className="text-secondary" />
              <h2 id="action-heading" className="text-sm font-semibold">Proposed tool action</h2>
              <span className="rounded bg-surface-subtle px-2 py-1 font-mono text-[11px] text-secondary">
                v{workspace.proposedAction.version}
              </span>
              <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${
                workspace.proposedAction.approvalRequired
                  ? "bg-warning-bg text-warning"
                  : "bg-neutral-bg text-neutral"
              }`}>
                {workspace.proposedAction.approvalRequired
                  ? "Human approval required"
                  : "Proposal not ready for execution"}
              </span>
            </div>
            <div className="p-5">
              <code className="text-sm font-semibold text-primary">{workspace.proposedAction.tool}</code>
              <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {Object.entries(workspace.proposedAction.parameters).map(([key, value]) => (
                  <div key={key} className="border-t border-border pt-3">
                    <dt className="font-mono text-[11px] text-muted">{key}</dt>
                    <dd className="mt-1 break-words text-sm font-medium text-primary">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 rounded-md bg-surface-subtle px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.05em] text-muted">
                  Expected postcondition
                </p>
                <p className="mt-1.5 text-sm leading-5 text-secondary">
                  {workspace.proposedAction.expectedPostcondition}
                </p>
              </div>
              <p className="mt-4 text-xs text-muted">
                Approval submission and execution are intentionally unavailable until Sprint 5.
              </p>
            </div>
          </section>

          <section aria-labelledby="activity-heading" className="rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 id="activity-heading" className="text-sm font-semibold">Activity preview</h2>
                <p className="mt-1 text-xs text-muted">{workspace.activity.length} business events</p>
              </div>
              <a
                href={`/tasks/${task.id}/runs/AR-8821`}
                className="inline-flex min-h-10 items-center gap-1 text-xs font-medium text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Open full timeline
                <ExternalLink aria-hidden="true" size={13} />
              </a>
            </div>
            <ol className="mt-5 space-y-4">
              {workspace.activity.map((event) => (
                <li key={event.id} className="grid grid-cols-[12px_minmax(0,1fr)_auto] gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 size-2.5 rounded-full ${
                      event.status === "waiting" ? "bg-warning" : "bg-success"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-primary">{event.label}</p>
                    <p className="mt-0.5 text-xs text-secondary">{event.detail}</p>
                  </div>
                  <time className="text-xs tabular-nums text-muted" dateTime={event.timestamp}>
                    {formatDateTime(event.timestamp)}
                  </time>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside aria-label="Task context" className="hidden space-y-5 xl:sticky xl:top-[76px] xl:block">
          <section aria-labelledby="booking-heading" className="rounded-lg border border-border bg-surface p-5">
            <h2 id="booking-heading" className="text-sm font-semibold">Booking</h2>
            <dl className="mt-4 space-y-3">
              {[
                ["Status", workspace.booking.status],
                ["Reference", task.booking.reference],
                ["Provider", workspace.booking.provider],
                ["Itinerary", workspace.booking.itinerary],
                ["Service date", task.booking.serviceDateLabel],
                ["Passengers", String(workspace.booking.passengers)],
                [
                  "Paid",
                  formatMoney(
                    workspace.booking.paidAmount.amount,
                    workspace.booking.paidAmount.currency,
                  ),
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-right text-sm font-medium capitalize text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="customer-heading" className="rounded-lg border border-border bg-surface p-5">
            <h2 id="customer-heading" className="text-sm font-semibold">Customer</h2>
            <p className="mt-4 text-sm font-semibold">{task.customer.name}</p>
            <p className="mt-1 text-xs text-secondary">{workspace.customer.contact}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded bg-warning-bg px-2 py-1 text-xs font-semibold uppercase text-warning">
                {workspace.customer.tier}
              </span>
              <span className="rounded bg-surface-subtle px-2 py-1 text-xs text-secondary">
                {workspace.customer.locale}
              </span>
            </div>
          </section>

          <section aria-labelledby="evidence-heading" className="rounded-lg border border-border bg-surface p-5">
            <h2 id="evidence-heading" className="text-sm font-semibold">Policy evidence</h2>
            <div className="mt-4 space-y-4">
              {workspace.evidence.map((evidence) => (
                <article key={evidence.id} className="border-l-2 border-info pl-3">
                  <p className="text-sm font-semibold text-primary">{evidence.title}</p>
                  <p className="mt-0.5 text-xs font-medium text-info">{evidence.clause}</p>
                  <p className="mt-2 text-xs leading-5 text-secondary">{evidence.excerpt}</p>
                  <p className="mt-1.5 text-[11px] text-muted">Effective {evidence.effectiveDate}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="risk-heading" className="rounded-lg border border-border bg-surface p-5">
            <h2 id="risk-heading" className="text-sm font-semibold">Deterministic risk checks</h2>
            <ul className="mt-4 space-y-4">
              {workspace.risks.map((risk) => {
                const presentation = riskPresentation[risk.outcome];
                const Icon = presentation.icon;
                return (
                  <li key={risk.id}>
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${presentation.className}`}>
                        <Icon aria-hidden="true" size={15} />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-primary">{risk.label}</p>
                        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                          {presentation.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-secondary">{risk.explanation}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
