"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Inbox,
  Search,
  ShieldCheck,
  Star,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const tasksActive = pathname.startsWith("/tasks");
  const evidenceActive = pathname.startsWith("/evidence");
  const secondaryWorkItems = [
    { label: "Assigned", count: 7, icon: UserCheck },
    { label: "Waiting review", count: 4, icon: Clock3 },
    { label: "Completed", count: null, icon: CheckCheck },
  ] as const;
  const operationalViews = [
    { label: "VIP", icon: Star, href: "/tasks?view=vip" },
    { label: "Urgent", icon: AlertTriangle, href: "/tasks?view=urgent" },
    { label: "High exposure", icon: CircleDollarSign, href: "/tasks?view=high_exposure" },
  ] as const;

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-50 -translate-y-20 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white focus:translate-y-0"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] border-r border-border bg-surface xl:flex xl:flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-white">
            <ShieldCheck aria-hidden="true" size={17} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-[-0.01em]">
              TravelOps
            </p>
            <p className="truncate text-[11px] text-muted">AI Worker</p>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 px-3 py-4">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Work
          </p>
          <Link
            href="/tasks"
            aria-current={tasksActive ? "page" : undefined}
            className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium ${tasksActive ? "bg-surface-selected text-primary" : "text-secondary"}`}
          >
            <Inbox aria-hidden="true" size={16} />
            <span className="flex-1">Task Inbox</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] tabular-nums text-secondary ring-1 ring-border">
              24
            </span>
          </Link>

          <div className="mt-1 space-y-0.5" aria-label="Planned work queues">
            {secondaryWorkItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  aria-disabled="true"
                  className="flex h-8 items-center gap-2.5 rounded-md px-3 text-[13px] text-secondary"
                >
                  <Icon aria-hidden="true" size={16} className="text-muted" />
                  <span className="flex-1">{item.label}</span>
                  {item.count ? <span className="text-xs tabular-nums text-muted">{item.count}</span> : null}
                </div>
              );
            })}
          </div>

          <div className="my-4 border-t border-border" />
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Engineering
          </p>
          <Link
            href="/evidence"
            aria-current={evidenceActive ? "page" : undefined}
            className={`flex h-9 items-center gap-2.5 rounded-md px-3 text-sm font-medium ${evidenceActive ? "bg-surface-selected text-primary" : "text-secondary"}`}
          >
            <Activity aria-hidden="true" size={16} />
            <span>Technical Evidence</span>
          </Link>

          <div className="my-4 border-t border-border" />
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Views
          </p>
          <div className="space-y-0.5" aria-label="Planned operational views">
            {operationalViews.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex h-8 items-center gap-2.5 rounded-md px-3 text-[13px] text-secondary"
                >
                  <Icon aria-hidden="true" size={16} className="text-muted" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <div className="rounded-md bg-surface-subtle px-3 py-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckCircle2 aria-hidden="true" className="text-success" size={15} />
              Scenario preview
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-muted">
              Deterministic demonstration data. No external action can be executed.
            </p>
          </div>
        </div>
      </aside>

      <div className="xl:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex items-center gap-3 xl:hidden">
            <div className="grid size-8 place-items-center rounded-md bg-primary text-white">
              <ShieldCheck aria-hidden="true" size={17} />
            </div>
            <span className="font-semibold">TravelOps</span>
          </div>

          <div className="hidden items-center gap-2 text-xs text-secondary xl:flex">
            <span className="size-2 rounded-full bg-success" aria-hidden="true" />
            Demo environment
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/evidence"
              aria-label="Technical Evidence"
              className="grid size-10 place-items-center rounded-md text-secondary xl:hidden"
            >
              <Activity aria-hidden="true" size={17} />
            </Link>
            <button
              type="button"
              aria-label="Search is planned for Task Inbox sprint"
              disabled
              className="grid size-10 cursor-not-allowed place-items-center rounded-md text-muted opacity-60"
            >
              <Search aria-hidden="true" size={17} />
            </button>
            <button
              type="button"
              aria-label="Notifications are not available in this preview"
              disabled
              className="grid size-10 cursor-not-allowed place-items-center rounded-md text-muted opacity-60"
            >
              <Bell aria-hidden="true" size={17} />
            </button>
            <div className="ml-2 grid size-8 place-items-center rounded-full bg-[#243447] text-xs font-semibold text-white" aria-label="Signed in as A. Rahman">
              AR
            </div>
          </div>
        </header>

        <main id="main-content" className="min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
