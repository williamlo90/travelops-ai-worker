"use client";

import {
  submitMockApprovalDecision,
  type ApprovalDecision,
  type ApprovalReviewState,
} from "@/domain/approvals/approval-review";
import type { TaskWorkspace } from "@/domain/tasks/task-workspace";
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, LockKeyhole } from "lucide-react";
import { useState } from "react";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount);
}

export function ApprovalReview({
  workspace,
  scenario,
}: {
  workspace: TaskWorkspace;
  scenario: "active" | "stale" | "expired";
}) {
  const initialStatus = scenario === "stale" ? "stale" : "pending";
  const [state, setState] = useState<ApprovalReviewState>({
    proposalVersion: workspace.proposedAction.version,
    evidenceVersion: 3,
    reservation: {
      status: scenario === "expired" ? "expired" : "active",
      reviewer: "A. Rahman",
      expiresAt: "2026-07-03T09:30:00.000Z",
    },
    status: initialStatus,
    decision: null,
  });
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const amount = workspace.recommendation.amount;
  const blocked = state.status !== "pending" || state.reservation.status !== "active";

  function decide(outcome: ApprovalDecision) {
    try {
      const next = submitMockApprovalDecision(state, {
        outcome,
        reason,
        expectedProposalVersion: workspace.proposedAction.version,
        expectedEvidenceVersion: 3,
        decidedAt: new Date().toISOString(),
      });
      setState(next);
      setError("");
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Decision failed.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-5 lg:px-6">
      <a
        href={`/tasks/${workspace.task.id}`}
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <ArrowLeft aria-hidden="true" size={16} />
        {workspace.task.id} Workspace
      </a>

      <header className="mt-2 border-b border-border pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.07em] text-muted">
              Approval Review · Proposal v{state.proposalVersion} · Evidence v{state.evidenceVersion}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
              Review {amount ? money(amount.amount, amount.currency) : ""} refund
            </h1>
            <p className="mt-2 text-sm text-secondary">
              {workspace.task.id} · {workspace.task.customer.name} · {workspace.task.booking.reference}
            </p>
          </div>
          <div className={`rounded-md px-3 py-2 text-sm font-medium ${
            state.reservation.status === "active"
              ? "bg-info-bg text-info"
              : "bg-danger-bg text-danger"
          }`}>
            <span className="inline-flex items-center gap-2">
              {state.reservation.status === "active" ? <LockKeyhole size={15} /> : <Clock3 size={15} />}
              {state.reservation.status === "active"
                ? "Reserved to you · 12 minutes remaining"
                : "Reservation expired"}
            </span>
          </div>
        </div>
      </header>

      {state.status === "stale" ? (
        <div role="alert" className="mt-5 flex gap-3 rounded-lg border border-danger/30 bg-danger-bg p-4 text-danger">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold">Proposal version is stale</p>
            <p className="mt-1 text-sm">Return to the workspace and review the latest proposal before deciding.</p>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.85fr)_minmax(320px,1fr)]">
        <div className="space-y-5">
          <section aria-labelledby="snapshot-heading" className="rounded-lg border border-border bg-surface p-5">
            <h2 id="snapshot-heading" className="text-sm font-semibold">Request and booking snapshot</h2>
            <blockquote className="mt-4 border-l-2 border-info pl-4 text-sm leading-6">
              “{workspace.request.customerMessage}”
            </blockquote>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Customer", workspace.task.customer.name],
                ["Booking", workspace.task.booking.reference],
                ["Provider", workspace.booking.provider],
                ["Paid", money(workspace.booking.paidAmount.amount, workspace.booking.paidAmount.currency)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="approval-evidence-heading" className="rounded-lg border border-border bg-surface p-5">
            <h2 id="approval-evidence-heading" className="text-sm font-semibold">Policy evidence</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {workspace.evidence.map((item) => (
                <article key={item.id} className="border-l-2 border-info pl-3">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs font-medium text-info">{item.clause}</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-muted">
                    Applicable clause
                  </p>
                  <mark className="mt-1 block bg-info-bg px-1 py-0.5 text-xs leading-5 text-secondary">
                    {item.excerpt}
                  </mark>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="immutable-action-heading" className="rounded-lg border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 id="immutable-action-heading" className="text-sm font-semibold">Immutable proposed action</h2>
              <p className="mt-1 text-xs text-muted">Bound to proposal v{state.proposalVersion}</p>
            </div>
            <div className="p-5">
              <code className="text-sm font-semibold">{workspace.proposedAction.tool}</code>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(workspace.proposedAction.parameters).map(([key, value]) => (
                  <div key={key} className="border-t border-border pt-3">
                    <dt className="font-mono text-[11px] text-muted">{key}</dt>
                    <dd className="mt-1 text-sm font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 rounded-md bg-surface-subtle p-3">
                <p className="text-xs font-semibold uppercase text-muted">Expected postcondition</p>
                <p className="mt-1.5 text-sm text-secondary">{workspace.proposedAction.expectedPostcondition}</p>
              </div>
            </div>
          </section>
        </div>

        <aside aria-labelledby="decision-heading" className="space-y-5 xl:sticky xl:top-[76px]">
          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 id="decision-heading" className="text-sm font-semibold">Decision</h2>
            <div className="mt-4 rounded-md border border-border bg-surface-subtle p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                You are deciding
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <dt className="text-muted">Refund</dt>
                <dd className="text-right font-semibold">
                  {amount ? money(amount.amount, amount.currency) : "—"}
                </dd>
                <dt className="text-muted">Customer</dt>
                <dd className="text-right font-semibold">{workspace.task.customer.name}</dd>
                <dt className="text-muted">Provider</dt>
                <dd className="text-right font-semibold">{workspace.booking.provider}</dd>
                <dt className="text-muted">Policy</dt>
                <dd className="text-right font-semibold">{workspace.evidence[0]?.clause}</dd>
                <dt className="text-muted">Tool</dt>
                <dd className="break-all text-right font-mono text-[11px] font-semibold">
                  {workspace.proposedAction.tool}
                </dd>
              </dl>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                <div>
                  <p className="text-[10px] uppercase text-muted">AI confidence</p>
                  <p className="mt-1 text-xs font-semibold capitalize">{workspace.recommendation.confidence}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted">Evidence</p>
                  <p className="mt-1 text-xs font-semibold">{workspace.evidence.length} policies</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-muted">Thresholds</p>
                  <p className="mt-1 text-xs font-semibold">
                    {workspace.risks.filter((risk) => risk.outcome === "requires_approval").length} triggered
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {workspace.risks.map((risk) => (
                <div key={risk.id} className="flex gap-3 border-b border-border pb-3 last:border-0">
                  <CheckCircle2
                    aria-hidden="true"
                    size={16}
                    className={risk.outcome === "passed" ? "mt-0.5 text-success" : "mt-0.5 text-warning"}
                  />
                  <div>
                    <p className="text-sm font-medium">{risk.label}</p>
                    <p className="mt-1 text-xs leading-5 text-secondary">{risk.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            <label htmlFor="decision-reason" className="mt-5 block text-sm font-semibold">
              Decision reason <span className="text-danger">*</span>
            </label>
            <p id="decision-reason-help" className="mt-1 text-xs text-muted">
              Required by the high-value refund policy. Minimum 8 characters.
            </p>
            <div aria-label="Quick decision reasons" className="mt-3 flex flex-wrap gap-2">
              {[
                ["Policy confirmed", "Applicable policy and waiver were confirmed."],
                ["Carrier cancelled", "Carrier cancellation was verified in the booking record."],
                ["Ticket unused", "Ticket status confirms the itinerary is unused."],
              ].map(([label, value]) => (
                <button
                  key={label}
                  type="button"
                  disabled={blocked}
                  onClick={() => setReason(value)}
                  className="min-h-9 rounded-full border border-border bg-surface px-3 text-xs font-medium hover:bg-surface-subtle disabled:opacity-45"
                >
                  {label}
                </button>
              ))}
            </div>
            <textarea
              id="decision-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              aria-describedby={`decision-reason-help${error ? " decision-error" : ""}`}
              rows={4}
              disabled={blocked}
              className="mt-2 w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:border-info focus-visible:ring-2 focus-visible:ring-focus disabled:bg-surface-subtle"
            />
            {error ? <p id="decision-error" role="alert" className="mt-2 text-sm text-danger">{error}</p> : null}

            {state.decision ? (
              <div role="status" className="mt-5 rounded-md bg-success-bg p-4 text-success">
                <p className="font-semibold">
                  {state.decision.outcome === "approved"
                    ? "Approved"
                    : state.decision.outcome === "rejected"
                      ? "Rejected"
                      : "Needs information"}
                </p>
                <p className="mt-1 text-xs">
                  Recorded by {state.decision.reviewer} against proposal v{state.decision.proposalVersion}.
                  No external action was executed.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                <div className="rounded-md border border-warning/25 bg-warning-bg p-3 text-xs text-warning">
                  <p className="font-semibold">If approved</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4">
                    <li>The version-bound approval decision is recorded.</li>
                    <li>The refund action becomes eligible for a later execution attempt.</li>
                    <li>The task remains unexecuted until a tool result is verified.</li>
                  </ul>
                </div>
                <button
                  type="button"
                  disabled={blocked}
                  onClick={() => decide("approved")}
                  className="min-h-10 w-full rounded-md bg-primary px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Approve {amount ? money(amount.amount, amount.currency) : ""} refund
                </button>
                <div className="my-3 border-t border-border" />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={blocked}
                    onClick={() => decide("needs_information")}
                    className="min-h-10 rounded-md border border-border px-3 text-sm font-medium disabled:opacity-45"
                  >
                    Request information
                  </button>
                  <button
                    type="button"
                    disabled={blocked}
                    onClick={() => decide("rejected")}
                    className="min-h-10 rounded-md border border-danger/40 px-3 text-sm font-medium text-danger disabled:opacity-45"
                  >
                    Reject proposal
                  </button>
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-muted">
              Mock decision only. Tool execution and result verification are not part of Sprint 5.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
