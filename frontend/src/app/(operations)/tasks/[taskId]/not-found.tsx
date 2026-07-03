import Link from "next/link";

export default function TaskNotFound() {
  return (
    <div className="mx-auto grid min-h-[420px] max-w-2xl place-items-center px-6 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Task not found</p>
        <h1 className="mt-2 text-xl font-semibold">This task is not available</h1>
        <p className="mt-2 text-sm text-secondary">
          It may have been removed, or the task identifier is incorrect.
        </p>
        <Link
          href="/tasks"
          className="mt-5 inline-flex rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-subtle"
        >
          Return to Task Inbox
        </Link>
      </div>
    </div>
  );
}
