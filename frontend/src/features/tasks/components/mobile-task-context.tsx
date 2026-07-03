"use client";

import type { TaskWorkspace } from "@/domain/tasks/task-workspace";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useState } from "react";

type ContextTab = "booking" | "evidence" | "risk";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount);
}

const riskPresentation = {
  passed: { label: "Passed", icon: CheckCircle2, className: "text-success" },
  requires_approval: { label: "Approval required", icon: ShieldAlert, className: "text-warning" },
  needs_information: { label: "Information needed", icon: AlertTriangle, className: "text-danger" },
} as const;

export function MobileTaskContext({ workspace }: { workspace: TaskWorkspace }) {
  const [tab, setTab] = useState<ContextTab>("booking");
  const tabs: Array<{ id: ContextTab; label: string }> = [
    { id: "booking", label: "Booking & customer" },
    { id: "evidence", label: `Evidence (${workspace.evidence.length})` },
    { id: "risk", label: `Risk checks (${workspace.risks.length})` },
  ];

  return (
    <section aria-labelledby="mobile-context-heading" className="mt-5 rounded-lg border border-border bg-surface xl:hidden">
      <h2 id="mobile-context-heading" className="sr-only">Task context</h2>
      <div role="tablist" aria-label="Task context" className="flex overflow-x-auto border-b border-border px-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`context-panel-${item.id}`}
            id={`context-tab-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              tab === item.id
                ? "border-action text-primary"
                : "border-transparent text-secondary hover:text-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`context-panel-${tab}`}
        aria-labelledby={`context-tab-${tab}`}
        className="p-4"
      >
        {tab === "booking" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold">Booking</h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted">Reference</dt>
                <dd className="text-right font-medium">{workspace.task.booking.reference}</dd>
                <dt className="text-muted">Provider</dt>
                <dd className="text-right font-medium">{workspace.booking.provider}</dd>
                <dt className="text-muted">Status</dt>
                <dd className="text-right font-medium capitalize">{workspace.booking.status}</dd>
                <dt className="text-muted">Paid</dt>
                <dd className="text-right font-medium">
                  {formatMoney(workspace.booking.paidAmount.amount, workspace.booking.paidAmount.currency)}
                </dd>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Customer</h3>
              <p className="mt-3 text-sm font-medium">{workspace.task.customer.name}</p>
              <p className="mt-1 text-xs text-secondary">{workspace.customer.contact}</p>
              <p className="mt-2 text-xs font-semibold uppercase text-warning">{workspace.customer.tier}</p>
            </div>
          </div>
        ) : null}

        {tab === "evidence" ? (
          <div className="space-y-4">
            {workspace.evidence.map((evidence) => (
              <article key={evidence.id} className="border-l-2 border-info pl-3">
                <h3 className="text-sm font-semibold">{evidence.title}</h3>
                <p className="mt-0.5 text-xs font-medium text-info">{evidence.clause}</p>
                <p className="mt-2 text-xs leading-5 text-secondary">{evidence.excerpt}</p>
              </article>
            ))}
          </div>
        ) : null}

        {tab === "risk" ? (
          <ul className="space-y-4">
            {workspace.risks.map((risk) => {
              const presentation = riskPresentation[risk.outcome];
              const Icon = presentation.icon;
              return (
                <li key={risk.id} className="flex gap-3">
                  <Icon aria-hidden="true" size={17} className={`mt-0.5 shrink-0 ${presentation.className}`} />
                  <div>
                    <p className="text-sm font-medium">{risk.label}</p>
                    <p className={`mt-0.5 text-xs font-semibold ${presentation.className}`}>
                      {presentation.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-secondary">{risk.explanation}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
