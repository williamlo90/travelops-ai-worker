# API Conventions

Status: Backend Sprint 0 contract.

## Boundary

- Base path: `/api`.
- JSON property names: `snake_case`.
- Resource paths: plural nouns.
- Public identifiers are opaque strings and never database sequence IDs.
- All timestamps use RFC 3339/ISO 8601 UTC with a `Z` suffix.
- Money is `{ "amount": "125.00", "currency": "USD" }`; amounts are decimal strings.
- Mutable resources expose an integer `version`.
- Clients send expected versions through the request body for domain commands.

Initial specified endpoints:

```text
GET /api/health/live
GET /api/health/ready
GET /api/tasks
GET /api/tasks/{task_id}
```

They are specifications only until implemented in later sprints.

## Correlation

- Clients may send `X-Correlation-ID`.
- The API validates or generates it and returns `X-Correlation-ID` on every response.
- The same ID is propagated into logs, audit events, runs, tool attempts, and provider-simulator calls.
- Correlation IDs aid investigation; they are not idempotency keys.

## Errors

Every non-2xx product error uses:

```json
{
  "error": {
    "code": "proposal_version_conflict",
    "message": "The proposal changed and must be reviewed again.",
    "correlation_id": "corr_01J...",
    "details": {
      "expected_version": 1,
      "current_version": 2
    }
  }
}
```

Rules:

- `code` is stable and machine-readable.
- `message` is safe for operator display.
- `details` contains no secrets, chain-of-thought, raw provider payload, or unnecessary PII.
- Validation errors follow the same envelope.
- Stack traces never cross the API boundary.

Baseline status usage:

| Status | Meaning |
|---:|---|
| `400` | Semantically invalid request not covered by field validation |
| `401` | Authentication required |
| `403` | Actor lacks authority |
| `404` | Resource does not exist or is not visible |
| `409` | Version, state, reservation, or idempotency conflict |
| `422` | Pydantic field validation failed |
| `429` | Rate limit exceeded |
| `500` | Unexpected internal failure |
| `503` | Required dependency is not ready |

Provider failure is normally persisted as workflow state and returned through the relevant resource;
it is not automatically translated into an HTTP `500`.

## Lists

Task lists use cursor pagination:

```json
{
  "items": [],
  "next_cursor": null
}
```

Filters and sort fields are allowlisted. Initial task-list parameters are `status`, `type`, `query`,
`sort`, `cursor`, and `limit`. The default and maximum limits are fixed by implementation and
documented in OpenAPI.

## Commands and concurrency

- Consequential commands are explicit subresources, not generic `PATCH` operations.
- Approval commands include `expected_proposal_version` and `expected_evidence_version`.
- Execution commands require a persisted valid approval; frontend flags are never authority.
- External writes use a server-generated, persisted idempotency key.
- A stale version returns `409`; the server never silently applies a command to newer data.

## Compatibility

- OpenAPI is the backend contract source once FastAPI exists.
- Frontend Zod schemas validate responses at the adapter boundary.
- Additive fields are permitted; removal or semantic changes require compatibility review.
- No `/v1` prefix is introduced until a real breaking-version requirement exists.

