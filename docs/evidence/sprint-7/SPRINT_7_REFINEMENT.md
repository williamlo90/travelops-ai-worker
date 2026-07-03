# Sprint 7 — Evidence surface refinement

Date: 2026-07-03

Technical Evidence was reduced from five tabs to two focused menus using KISS:
`Evaluation Cases` and `Architecture Proof`. Runs and failure evidence live inside Evaluation Cases;
Known Limitations lives with Architecture Proof.

The final navigation is:

1. Evaluation Cases — expected versus actual behavior and underlying run links.
2. Architecture Proof — implemented invariants, test paths, and known limitations.

The rejected case-study overview, engineering-story copy, timeout diagram, metric cards, Runs tab,
and Failure Tests tab were removed.

Verification: ESLint and TypeScript passed; Vitest passed 29 tests; targeted Playwright passed 6
desktop/laptop tests including Axe; production build passed.

## Credibility refinement

- Golden expectations and observed workflow output now use separate validated fixtures.
- The deterministic evaluator joins them by case ID and fails when an observed result is missing.
- Header provenance identifies golden dataset `travelops-refund-v1.0`, observed output
  `workflow-output-v1`, and deterministic evaluator v2.
- The failed citation-applicability case now states impact, safety disposition, and next action.
- No production execution, telemetry, or deployment claim was added.
