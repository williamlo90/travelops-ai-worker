export default function TaskLoading() {
  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-5 lg:px-6">
      <div className="h-8 w-40 animate-pulse rounded bg-surface-subtle" />
      <div className="mt-6 h-72 animate-pulse rounded-lg border border-border bg-surface" />
      <p className="sr-only" role="status">Loading task data</p>
    </div>
  );
}
