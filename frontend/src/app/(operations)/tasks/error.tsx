"use client";

export default function TaskError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto grid min-h-[420px] max-w-2xl place-items-center px-6 text-center">
      <div>
        <h1 className="text-xl font-semibold">Task data is unavailable</h1>
        <p className="mt-2 text-sm text-secondary">
          The backend did not return a valid task response. No mock data was substituted.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-surface-subtle"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
