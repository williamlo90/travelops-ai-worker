# Backend Delivery Contract

Status: Accepted scope proposal for Backend Sprint 0. No backend runtime exists yet.

## 1. Product boundary

The first backend vertical slice resolves one refund request safely:

```text
ingest request
→ load immutable booking and customer snapshots
→ retrieve applicable policy evidence
→ produce a typed proposal
→ obtain version-bound approval
→ execute an idempotent refund
→ verify the provider postcondition
→ reconcile if the execution outcome is uncertain
→ retain audit and evaluation evidence
```

The backend is a modular monolith. API, orchestration, retrieval, tools, approvals, execution, audit,
and evaluation are code boundaries inside one deployable application until operational evidence
justifies separation.

### In scope

- One deeply implemented refund workflow.
- Deterministic provider simulator before any real provider integration.
- Durable workflow and business state in PostgreSQL.
- Existing Next.js frontend integration through typed HTTP contracts.
- Human approval for consequential actions.
- Explicit failure, uncertainty, verification, and reconciliation behavior.

### Non-goals

- Chatbot, generic agent framework, or visual workflow builder.
- Ticket change, hotel, and cancellation execution.
- Multiple cooperating agents.
- Real airline/payment integration.
- Kubernetes, service mesh, microservices, or multi-region deployment.
- Production-traffic, compliance, or enterprise-scale claims without evidence.

## 2. Flagship acceptance scenarios

These scenarios are release contracts, not optional demonstrations.

| ID | Scenario | Required result |
|---|---|---|
| RF-AC-01 | Provider accepts refund and lookup confirms the expected receipt and amount | `completed_verified`; no further write is permitted |
| RF-AC-02 | Provider fails before accepting the request | `failed_no_side_effect`; a controlled retry may use the same idempotency key |
| RF-AC-03 | Provider accepts the request but the client times out before receiving the response | `execution_uncertain`; blind retry is blocked and reconciliation is required |
| RF-AC-04 | Proposal or evidence changes after approval context was loaded | Approval returns a version conflict; execution remains blocked |
| RF-AC-05 | Retrieved policy is missing, stale, conflicting, or inapplicable | No executable proposal; task is escalated or held for information |

Every scenario must retain the correlation ID, state transitions, relevant versions, tool attempts,
side-effect knowledge, and final safety disposition.

## 3. Canonical workflow states

| State | Meaning | Allowed next states |
|---|---|---|
| `queued` | Durable work exists but no worker owns active processing | `running`, `escalated` |
| `running` | A worker is executing a non-terminal workflow step | `waiting_approval`, `completed_verified`, `failed_no_side_effect`, `execution_uncertain`, `escalated` |
| `waiting_approval` | A typed proposal exists, but valid version-bound human authority is required | `queued`, `escalated` |
| `completed_verified` | Provider postcondition independently confirms the intended side effect | Terminal |
| `failed_no_side_effect` | The system knows the provider did not create the side effect | `queued`, `escalated` |
| `execution_uncertain` | A side effect may exist, but the system cannot prove its state | `reconciling`, `escalated` |
| `reconciling` | The system is querying provider state; no duplicate write is permitted | `completed_verified`, `failed_no_side_effect`, `execution_uncertain`, `escalated` |
| `escalated` | Automated progress stopped and accountable human intervention is required | Terminal for the automated run |

Rules:

1. `completed_verified` requires a persisted `PostconditionCheck`; provider submission success alone
   is insufficient.
2. `failed_no_side_effect` requires affirmative evidence that no external side effect occurred.
3. `execution_uncertain` never exposes automatic retry.
4. Approval resumes work by creating durable queued work; an HTTP request does not execute the refund.
5. A new proposal or evidence version invalidates prior approval authority.
6. Terminal state history is immutable; a new attempt creates a new run or reconciliation record.

## 4. Frontend-to-backend contract migration

Frontend display status and backend workflow state serve different purposes and remain separate.

| Existing frontend field | Backend source | Migration rule |
|---|---|---|
| `task.id` | `Task.public_id` | Preserve durable IDs such as `RF-1042` |
| `task.status` | Derived task presentation status | Map from workflow, information, and approval state; do not expose the workflow enum directly |
| `task.dueInMinutes` | Task SLA deadline | Backend returns `due_at`; frontend derives relative minutes |
| `task.exposure` | Current proposal/risk projection | Nullable until a validated amount exists |
| `request` | `Request` | ISO-8601 timestamps in UTC |
| `customer` | `CustomerSnapshot` | Snapshot is immutable for a run |
| `booking` | `BookingSnapshot` | Snapshot is immutable for a run |
| `evidence[]` | `RetrievalEvidence` plus `PolicyDocumentVersion` | Return exact version, clause, excerpt, and applicability |
| `risks[]` | `RiskDecision` details | Backend owns risk outcome; frontend only renders it |
| `recommendation` | Current `ProposalVersion` summary | Structured output; no chain-of-thought |
| `proposedAction.version` | `ProposalVersion.version` | Required by approval and execution commands |
| Approval evidence version | Retrieval evidence snapshot version | Required with proposal version on decision submission |
| `activity[]` | Read model derived from `AuditEvent` | Human-readable labels are API presentation fields |
| Agent run timeline | `AgentRun`, `ToolAttempt`, `PostconditionCheck` | Fixture scenarios become persisted observed records |

The migration sequence is:

1. Keep the current `TaskRepository` interface.
2. Add an HTTP adapter alongside the deterministic mock adapter.
3. Validate API responses at the frontend boundary.
4. Switch Inbox and Workspace reads to API mode.
5. Retain mock mode only as explicitly labelled offline/demo support.
6. Move approval and recovery mutations only after their backend governance sprints.

## 5. Local command contract

Sprint 0 selects the commands; Sprint 1 makes backend commands executable and Sprint 3 provides the
container command.

| Purpose | Windows / local command | CI-oriented command |
|---|---|---|
| Install backend dependencies | `uv sync --frozen` | `uv sync --frozen` |
| Run API | `uv run uvicorn app.main:app --reload --port 8000` | `uv run uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| Migrate database | `uv run alembic upgrade head` | `uv run alembic upgrade head` |
| Unit/integration tests | `uv run pytest` | `uv run pytest` |
| Lint | `uv run ruff check .` | `uv run ruff check .` |
| Format check | `uv run ruff format --check .` | `uv run ruff format --check .` |
| Type-check | `uv run mypy app tests` | `uv run mypy app tests` |
| Frontend checks | Run `pnpm lint`, `pnpm typecheck`, then `pnpm test` | `pnpm lint && pnpm typecheck && pnpm test` |
| Development stack | `podman compose -f compose.dev.yaml up --build` | Compose smoke begins in Sprint 3 |

Selected baseline: Python 3.12, `uv`, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, Pytest, Ruff, and
Mypy. Exact dependency versions are locked when Sprint 1 creates `backend/uv.lock`.

## 6. Sprint review gate

### Definition of Ready

A backend sprint may start only when:

- its user-visible or operational outcome is stated;
- required inputs and prior migrations exist;
- API and state changes are identified;
- acceptance scenarios and failure injection are named;
- tests and evidence are specified before implementation;
- rejected scope is explicit;
- the previous sprint has human approval.

### Required evidence at sprint close

Each backend sprint adds `docs/evidence/backend-sprint-NN/README.md` containing:

- goal and delivered scope;
- commands actually executed and their results;
- acceptance scenarios exercised;
- decisions and trade-offs;
- rejected scope;
- known limitations;
- reviewer verdict and next-sprint boundary.

Generated test, evaluation, migration, or trace artifacts are retained only when they substantiate a
claim. Screenshots are required only for user-interface evidence.

### Approval gate

Passing automated checks does not authorize the next sprint. Each sprint stops after engineering
review and documentation update until the user explicitly approves continuation.
