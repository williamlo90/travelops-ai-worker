# Backend Sprint 6 — Agent orchestration to proposal

## Outcome

A persisted refund task can now start a LangGraph run that:

1. classifies the request through a provider-neutral model gateway;
2. records that policy retrieval is still pending;
3. applies deterministic eligibility rules;
4. applies deterministic risk rules;
5. emits and persists a typed, versioned draft proposal.

The default model adapter is deterministic. It makes CI and the local demo repeatable without an API
key.

## Durable boundaries

- LangGraph checkpoints are stored in PostgreSQL under the run public ID.
- Checkpoint schema setup is an explicit deployment step, not DDL executed by an API request.
- `proposal_versions` and `risk_decisions` are separate durable business records.
- Model provider, model version, prompt version, graph version, and risk-rule version are recorded.
- Resuming a completed graph returns the existing proposal without repeating completed nodes.
- A model timeout, unavailable provider, or invalid structured output cannot persist a proposal.
- No chain-of-thought is requested or stored.

## API

```text
POST /api/tasks/{task_id}/agent-runs
GET  /api/agent-runs/{run_id}
GET  /api/tasks/{task_id}/proposals/{version}
```

Passing `{"run_id": "AR-..."}` to the POST resumes an existing run belonging to the task.

## Scope boundary

The proposal is deliberately `draft_waiting_evidence`. Sprint 6 does not pretend that policy RAG has
already run, does not make the proposal approval-ready, and does not execute the refund tool.

No Redis queue, approval mutation, vector retrieval, real LLM provider, or multi-agent design is
included.
