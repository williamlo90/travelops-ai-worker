import {
  AlertTriangle,
  FileCode2,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { evaluatedDatasetFixture } from "@/mocks/fixtures/evaluation-fixtures";

export type EvidenceView = "evaluations" | "architecture";

function ResultPill({ result }: { result: "passed" | "failed" }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${result === "passed" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>{result === "passed" ? "Passed" : "Failed"}</span>;
}

function Header({ activeView }: { activeView: EvidenceView }) {
  const items: Array<{ view: EvidenceView; label: string }> = [
    { view: "evaluations", label: "Evaluation Cases" },
    { view: "architecture", label: "Architecture Proof" },
  ];
  return (
    <>
      <header className="border-b border-border bg-surface px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Engineering proof</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">Technical Evidence</h1>
            <span className="rounded-full bg-warning-bg px-3 py-1.5 text-xs font-semibold text-warning">Local demo evidence</span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">Deterministic evaluation results and implementation evidence. No production telemetry is claimed.</p>
          <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-xs">
            <div><dt className="inline text-muted">Golden </dt><dd className="inline font-mono font-medium">{evaluatedDatasetFixture.goldenVersion}</dd></div>
            <div><dt className="inline text-muted">Observed </dt><dd className="inline font-mono font-medium">{evaluatedDatasetFixture.observedVersion}</dd></div>
            <div><dt className="inline text-muted">Evaluated </dt><dd className="inline font-medium">03 Jul 2026 · deterministic v2</dd></div>
          </dl>
        </div>
      </header>
      <nav aria-label="Technical evidence sections" className="border-b border-border bg-surface px-5 sm:px-8">
        <div className="mx-auto flex max-w-[1400px] gap-6">
          {items.map((item) => <Link key={item.view} href={item.view === "evaluations" ? "/evidence" : "/evidence?view=architecture"} aria-current={activeView === item.view ? "page" : undefined} className={`border-b-2 py-3 text-sm font-medium ${activeView === item.view ? "border-action text-primary" : "border-transparent text-secondary hover:text-primary"}`}>{item.label}</Link>)}
        </div>
      </nav>
    </>
  );
}

function EvaluationCases() {
  const { summary } = evaluatedDatasetFixture;
  return (
    <section aria-labelledby="evaluation-heading">
      <h2 id="evaluation-heading" className="text-xl font-semibold">Evaluation Cases</h2>
      <p className="mt-1 text-sm text-secondary">Expected behavior, actual behavior, and safety evidence.</p>
      <dl aria-label="Evaluation summary" className="mt-4 grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-r border-border px-4 py-3"><dt className="text-xs font-medium text-muted">Total</dt><dd className="mt-1 text-xl font-semibold tabular-nums">{summary.total}</dd></div>
        <div className="border-r border-border px-4 py-3"><dt className="text-xs font-medium text-success">Passed</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-success">{summary.passed}</dd></div>
        <div className="px-4 py-3"><dt className="text-xs font-medium text-danger">Failed</dt><dd className="mt-1 text-xl font-semibold tabular-nums text-danger">{summary.failed}</dd></div>
      </dl>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
          <thead className="bg-surface-subtle text-xs text-secondary"><tr><th className="px-4 py-3 font-semibold">Scenario</th><th className="px-4 py-3 font-semibold">Expected</th><th className="px-4 py-3 font-semibold">Actual</th><th className="px-4 py-3 font-semibold">Policy evidence</th><th className="px-4 py-3 font-semibold">Tool / recovery</th><th className="px-4 py-3 font-semibold">Result</th></tr></thead>
          <tbody className="divide-y divide-border">{evaluatedDatasetFixture.cases.map((item) => <tr key={item.id} id={item.id} className="align-top"><td className="px-4 py-4"><Link href={item.runHref} className="font-semibold hover:text-action hover:underline">{item.scenario}</Link><p className="mt-1 font-mono text-[11px] text-muted">{item.id}</p>{item.failureReason ? <p className="mt-2 max-w-sm text-xs leading-5 text-danger">{item.failureReason}</p> : null}</td><td className="px-4 py-4 text-secondary">{item.expectedDecision.replaceAll("_", " ")}</td><td className={item.result === "failed" ? "px-4 py-4 font-medium text-danger" : "px-4 py-4 text-secondary"}>{item.actualDecision.replaceAll("_", " ")}</td><td className="px-4 py-4 text-secondary">{item.policyCitation}<p className="mt-1 text-xs text-muted">{item.approval}</p></td><td className="px-4 py-4 font-mono text-xs text-secondary">{item.tool}</td><td className="px-4 py-4"><ResultPill result={item.result}/>{item.failedChecks.length ? <><p className="mt-2 max-w-[210px] text-[11px] leading-4 text-danger">{item.failedChecks.join(", ")}</p><dl className="mt-3 max-w-[240px] space-y-2 border-t border-border pt-3 text-xs font-normal leading-4"><div><dt className="font-semibold text-primary">Impact</dt><dd className="text-secondary">{item.impact}</dd></div><div><dt className="font-semibold text-primary">Disposition</dt><dd className="text-secondary">{item.safetyDisposition}</dd></div><div><dt className="font-semibold text-primary">Next action</dt><dd className="text-secondary">{item.nextAction}</dd></div></dl></> : null}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

const proofs = [
  { icon: FileCode2, title: "Runtime contracts", invariant: "Invalid task, approval, run, and evaluation fixtures fail before rendering.", implementation: "src/domain/**", tests: "src/domain/**/*.test.ts" },
  { icon: ShieldCheck, title: "Safe recovery", invariant: "Uncertain execution requires reconciliation; retry is allowed only after confirmed no-side-effect failure.", implementation: "src/domain/runs/agent-run.ts", tests: "src/domain/runs/agent-run.test.ts" },
  { icon: FlaskConical, title: "Approval versioning", invariant: "Stale proposal/evidence versions and expired reviewer reservations block decisions.", implementation: "src/domain/approvals/approval-review.ts", tests: "src/domain/approvals/approval-review.test.ts" },
] as const;

function ArchitectureProof() {
  return (
    <section aria-labelledby="architecture-heading">
      <h2 id="architecture-heading" className="text-xl font-semibold">Architecture Proof</h2>
      <p className="mt-1 text-sm text-secondary">Three implemented invariants and their executable tests.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">{proofs.map((proof) => { const Icon = proof.icon; return <article key={proof.title} className="rounded-lg border border-border bg-surface p-5"><Icon aria-hidden="true" className="text-action" size={20}/><h3 className="mt-4 font-semibold">{proof.title}</h3><p className="mt-2 text-sm leading-6 text-secondary">{proof.invariant}</p><code className="mt-4 block rounded bg-surface-subtle px-2 py-1.5 text-xs text-secondary">{proof.implementation}</code><code className="mt-2 block rounded bg-surface-subtle px-2 py-1.5 text-xs text-secondary">{proof.tests}</code></article>; })}</div>
      <div className="mt-6 rounded-lg border border-warning/30 bg-warning-bg p-5"><div className="flex items-center gap-2"><AlertTriangle aria-hidden="true" className="text-warning" size={18}/><h3 className="font-semibold">Known Limitations</h3></div><ul className="mt-4 grid gap-2 text-sm leading-6 text-secondary md:grid-cols-2"><li>• Frontend-only deterministic demonstration.</li><li>• No authentication or server-side authorization.</li><li>• No backend workflow or durable persistence.</li><li>• No live airline, policy, refund, or model provider.</li><li>• No production observability or immutable audit log.</li><li>• No load, security, cost, or representative-user evidence.</li></ul></div>
    </section>
  );
}

export function TechnicalEvidence({ activeView }: { activeView: EvidenceView }) {
  return <div className="min-h-[calc(100vh-56px)] bg-canvas"><Header activeView={activeView}/><div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">{activeView === "evaluations" ? <EvaluationCases/> : <ArchitectureProof/>}</div></div>;
}
