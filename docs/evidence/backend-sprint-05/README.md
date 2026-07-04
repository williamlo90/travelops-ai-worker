# Backend Sprint 5 — Typed tools and provider simulator

## Outcome

The backend now has an allowlisted `ToolRegistry` with strict Pydantic contracts for:

- `get_booking`
- `get_customer`
- `create_refund_request`
- `get_refund`

The deterministic provider simulator supports success, rejection before a side effect, timeout before
send, timeout after provider acceptance, duplicate idempotency delivery, and delayed postcondition
visibility.

## Safety evidence

- Unknown tools cannot be invoked through the registry.
- Extra or invalid fields fail Pydantic validation.
- Write tools require an idempotency key.
- Duplicate delivery returns the original logical provider receipt.
- Timeout before send records `not_attempted`.
- Rejection before creation records `none`.
- Timeout after acceptance records `possible`; it does not fabricate a receipt from an absent
  response.
- Successful creation records `confirmed`.
- Persisted tool input/output is recursively redacted for named PII/secret fields.
- Tool attempts remain separate from external receipts, preserving the difference between an observed
  response and a possible provider-side effect.

## Persistence

Migration `20260704_0003` adds:

- `tool_attempts`
- `external_receipts`

The provider/tool/idempotency tuple is unique for external receipts. Repeated attempts remain
auditable while only one logical receipt is retained.

## Verification

Run from `backend`:

```powershell
python -m uv run ruff check app tests
python -m uv run ruff format --check app tests
python -m uv run mypy app tests
python -m uv run pytest
```

PostgreSQL integration tests require `TEST_DATABASE_URL` as documented in
`backend/README.md`.

## Scope boundary

This sprint does not add LangGraph, Redis, automatic retries, approval execution, public simulator
routes, RAG, or a real travel provider. Reliable asynchronous execution and reconciliation remain
Sprint 9 concerns.
