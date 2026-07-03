# Sprint 7 — Engineering and Design Review

Date: 2026-07-03

## Outcome

Sprint 7 is complete. Technical Evidence is a controlled secondary area for engineering proof rather
than an operator dashboard. Its metrics are derived from inspectable, versioned evaluation cases and
every summary number links to the underlying evidence.

## Delivered

- Durable `/evidence` route available from desktop and laptop navigation.
- One recruiter-facing case-study page with Engineering Claims, Failure Recovery Story,
  Evaluation Cases, Architecture Proof, and Known Limitations sections.
- Runtime-validated `travelops-refund-v1.0` evaluation dataset.
- Deterministic evaluator that derives case results and summary totals.
- Six refund workflow cases: five passing and one intentionally preserved regression.
- Explicit safe-retry and reconciliation coverage linked to Agent Run Timeline scenarios.
- Known citation-applicability failure with expected versus actual decision and failed checks.
- Architecture claims linked to inspectable source areas rather than unsupported diagrams.
- Explicit statement of unavailable model, provider, security, load, user-study, and production evidence.

## Evaluation snapshot

| Measure | Result | Meaning |
|---|---:|---|
| Dataset | `travelops-refund-v1.0` | Versioned local deterministic fixture |
| Cases | 6 | Refund, safety, and failure-recovery scenarios |
| Passed | 5 | All explicit checks satisfied |
| Failed | 1 | Citation-applicability regression `EVAL-006` |
| Pass rate | 83% | Computed as `5 / 6`, not a production KPI |
| Recovery coverage | 2/2 | Safe retry and reconciliation represented |

The known evaluation failure is expected test data, not a failing engineering gate. Unit tests verify
that the evaluator continues to detect it. A green automated suite therefore does not erase the red
product regression.

## Architecture review

The evaluation schema separates expected decision, actual decision, policy citation, approval state,
tool choice, recovery, and postcondition. Summary values are computed from those cases rather than
hard-coded independently. The UI links metrics to case rows and run scenarios, preserving a path from
claim to evidence.

Raw model prompts, chain-of-thought, provider payloads, token counts, spans, and production correlation
are absent because the current frontend does not capture them. The UI says so instead of fabricating
technical depth.

## Design QA

- Engineering proof remains outside Task Inbox and Task Workspace.
- Summary metrics are compact and clickable; there is no chart wall.
- Dataset, evaluator, and snapshot provenance appear before metrics.
- The known failure is visible on the Overview instead of buried in a table.
- Evaluation rows remain comparable at desktop width and horizontally scroll at narrower widths.
- Laptop navigation provides direct access without restoring a full sidebar.
- Browser inspection found no horizontal page overflow and no console warnings or errors.
- An existing AI-label contrast defect was corrected from 4.48:1 to a passing value.

## Verification

| Gate | Result |
|---|---:|
| ESLint | Passed |
| TypeScript | Passed |
| Vitest | 14 files, 30 tests passed |
| Playwright | 44 passed, 2 intentional responsive skips |
| Axe | Zero automatically detectable violations |
| Next.js production build | Passed |
| Browser visual and console QA | Passed |

## Known limitations

- Frontend-only deterministic demonstration.
- No real model or airline/refund/policy provider.
- No backend workflow, durable persistence, authentication, or server-side authorization.
- No immutable production audit store or observability pipeline.
- No representative-user, load, security, latency, token-cost, or SLO evidence.
- Evaluation coverage is intentionally small and refund-specific.

## Defensible maturity claim

TravelOps demonstrates production-shaped frontend state modeling for evidence-backed proposals,
version-bound approval, execution outcomes, safe recovery, and deterministic evaluation. It does not
demonstrate a production-deployed or enterprise-ready AI system.

## Gate

The approved Sprint 1–7 frontend sequence is complete. Any backend, real-provider, authentication,
observability, deployment, or scope expansion requires a new reviewed plan rather than an implicit
continuation.
