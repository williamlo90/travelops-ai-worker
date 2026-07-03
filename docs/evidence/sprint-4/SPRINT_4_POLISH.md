# Sprint 4 — Post-review UX polish

Date: 2026-07-03

## Review finding

`Review action` implied entry into a decision mode even though Sprint 4 only scrolled to the
read-only proposed tool action. The label promised an approval experience that does not exist until
Sprint 5.

## Accepted and implemented

- Renamed the CTA to `Inspect proposed action`.
- Kept it as an in-page anchor because Sprint 4 is an understanding and inspection workspace.
- Added a direction icon to communicate movement within the page.
- Made the exact proposed-action region a focusable fragment target.
- Added visible target/focus rings so the destination is unmistakable after navigation.
- Added component and E2E assertions for wording, destination, hash state, and visibility.

## Deferred

- Approval drawer or dedicated Approval Review page: Sprint 5, after reservation, decisions,
  reasons, proposal versions, and stale-state semantics exist.
- Workflow stepper: deferred until those workflow states are real and state-backed. A decorative
  stepper would imply progress guarantees the system does not yet implement.

## Rejected for Sprint 4

- Reusing the same Workspace as a fake approval mode.
- Adding Approve, Reject, Modify, or Reason controls without safe mutations and version binding.

## Verification

- ESLint passed.
- TypeScript passed.
- Vitest: 8 files, 14 tests passed.
- Playwright: 22 passed, 2 intentional responsive skips.
- Next.js production build passed.
- Browser QA confirmed the hash, scroll destination, visible target ring, and zero console errors.

Sprint 5 remains unimplemented and requires explicit approval.
