# TravelOps AI Worker — Flagship System Blueprint

Status: Target architecture. Frontend Sprint 1–7 is implemented; backend, model, infrastructure,
deployment, and production controls described below are not yet implemented.

## 1. Product thesis

TravelOps AI Worker is a task-centric agentic system for resolving travel-operation exceptions such
as refunds, ticket changes, cancellations, and booking failures.

The flagship proof is one production-shaped refund workflow:

```text
Incoming request
→ classify intent
→ retrieve booking and customer context
→ retrieve applicable policy
→ validate eligibility and risk
→ propose a typed action
→ obtain version-bound approval
→ execute through an idempotent tool
→ verify the external postcondition
→ reconcile uncertain outcomes
→ retain audit and evaluation evidence
```

It is not a chatbot, generic agent framework, workflow builder, or collection of disconnected AI
demos.

## 2. Portfolio objective

The repository must prove that its owner can:

- design an agentic workflow around durable business state;
- integrate models with typed tools, APIs, databases, and retrieval;
- handle approval, retries, timeouts, partial failure, and duplicate-side-effect risk;
- evaluate expected behavior against observed workflow output;
- deploy and operate the system with security, observability, and release controls;
- explain architectural decisions and limitations without claiming unsupported production maturity.

“Enterprise” is demonstrated by executed evidence, not by the number of technologies named.

## 3. Scope and non-goals

### Core scope

- One deeply implemented refund workflow.
- Deterministic carrier/provider simulator.
- Real backend orchestration, persistence, RAG, tools, approval, audit, and evaluation.
- Existing Next.js operator frontend.
- Local production-shaped deployment using containers and CI.

### Deliberate non-goals

- No multi-agent swarm.
- No visual workflow builder.
- No connector marketplace.
- No broad travel booking engine.
- No generic chatbot home screen.
- No Kubernetes requirement before the OCI Compose deployment is operationally insufficient.
- No Hadoop/lakehouse cluster bundled only to satisfy keywords.
- No fabricated production traffic, SLO, cost, or model-quality claims.

## 4. Users

### Travel Operations Specialist

Understands the request, checks evidence, handles exceptions, and monitors execution.

### Supervisor

Reviews consequential actions, verifies policy and risk, and records an attributable decision.

### AI Systems Engineer / Auditor

Inspects traces, tool attempts, evaluation results, failure scenarios, versions, and release evidence.

### Platform Administrator

Maintains model/provider configuration, policies, access, secrets, and operational controls.

## 5. User experiences

The frontend remains intentionally small:

1. **Task Inbox** — prioritize and open operational work.
2. **Task Workspace** — inspect request, booking, customer, policy, risk, and proposal.
3. **Approval Review** — make a version-bound human decision.
4. **Agent Run Timeline** — understand execution and recovery.
5. **Technical Evidence** — inspect evaluation cases and architecture proof.

Technical Evidence is not an operator dashboard. Raw traces and engineering metadata remain secondary
to the business workflow.

## 6. Target architecture

```text
Next.js Operator UI
        │
        ▼
FastAPI Application API
        │
        ├── TaskService
        ├── ApprovalService
        ├── PolicyService
        ├── AuditService
        └── EvaluationService
        │
        ▼
LangGraph AgentOrchestrator
        │
        ├── ModelGateway
        ├── PolicyRetriever
        ├── ToolRegistry
        ├── RiskPolicy
        └── RecoveryCoordinator
        │
        ├───────────────┬────────────────┐
        ▼               ▼                ▼
PostgreSQL + pgvector  Redis worker     Provider simulator
        │                                │
        └───────────────┬────────────────┘
                        ▼
             OpenTelemetry evidence
```

### Runtime choices

| Concern | Target |
|---|---|
| Frontend | Next.js, React, strict TypeScript |
| Backend API | FastAPI, Python, Pydantic |
| Orchestration | LangGraph with explicit state transitions |
| Persistence | PostgreSQL |
| Retrieval | pgvector with versioned policy documents |
| Background work | Redis-backed worker/queue |
| Model access | Provider-neutral model gateway |
| Local/private inference | Optional vLLM-compatible profile |
| Observability | OpenTelemetry traces, metrics, structured logs |
| Packaging | OCI Containerfiles and Compose Specification; Docker Compose verified, Podman compatible |
| CI | GitHub Actions |
| Tests | Pytest, Vitest, Playwright |

The default system is a modular monolith. Services are code boundaries, not premature microservices.

## 7. Domain state

Core durable records:

- Task
- Request
- BookingSnapshot
- CustomerSnapshot
- PolicyDocumentVersion
- RetrievalEvidence
- RiskDecision
- ProposalVersion
- ApprovalDecision
- AgentRun
- ToolAttempt
- ExternalReceipt
- PostconditionCheck
- AuditEvent
- EvaluationResult

Every consequential action binds:

```text
task version
+ proposal version
+ evidence version
+ approval reference
+ exact tool parameters
+ idempotency key
+ expected postcondition
```

## 8. Agent orchestration

The graph must expose explicit nodes rather than one opaque model call:

```text
ingest_request
→ classify_task
→ load_booking_context
→ retrieve_policy
→ validate_evidence
→ calculate_eligibility
→ evaluate_risk
→ build_proposal
→ wait_for_approval
→ execute_tool
→ verify_postcondition
→ complete | fail | reconcile | escalate
```

Requirements:

- resumable from durable state;
- deterministic routing for policy, authority, and recovery decisions;
- model output validated with Pydantic schemas;
- no chain-of-thought persistence or display;
- prompt, model, policy, tool, and graph versions recorded;
- replayable development scenarios without executing external side effects.

## 9. Model gateway

The system must not couple workflow logic to one provider.

Required capabilities:

- LLM adapter for classification and structured proposal generation;
- embedding adapter for policy retrieval;
- optional local/private adapter compatible with vLLM;
- timeout, rate-limit, retry, and fallback policy;
- provider/model/version metadata in technical evidence;
- token, latency, and cost capture when supplied by the provider;
- redaction of secrets and sensitive customer data.

MoE and visual models are capability profiles, not mandatory calls in the refund path. A visual-model
extension may process supporting travel documents only after the core workflow is complete. The
architecture documentation must explain where MoE, visual, or private models would be selected and
why.

## 10. Typed tool layer

Initial tools:

```text
get_booking(booking_id)
get_customer(customer_id)
search_policy(query, booking_context)
check_refund_eligibility(booking, policy_evidence)
calculate_refund_amount(booking)
create_refund_request(approved_proposal, idempotency_key)
get_refund(external_reference | idempotency_key)
create_ticket_change(approved_proposal, idempotency_key)
draft_customer_response(task, verified_outcome)
escalate_to_human(task, reason)
```

Every tool has:

- Pydantic input/output schema;
- authorization requirement;
- timeout and retry classification;
- idempotency strategy;
- redacted audit representation;
- deterministic simulator implementation;
- contract and failure tests.

The model may select only registered tools. It cannot construct arbitrary network calls.

## 11. RAG and policy evidence

Knowledge corpus:

- refund policy;
- cancellation policy;
- ticket-change policy;
- airline waiver rules;
- escalation SOP;
- customer communication guidelines.

Pipeline:

```text
document ingest
→ parse and normalize
→ attach carrier/product/jurisdiction/effective-date metadata
→ chunk
→ embed
→ store in pgvector
→ retrieve candidates
→ filter applicability
→ detect conflicts/staleness
→ return cited evidence
```

Required proof:

- versioned ingestion command;
- retrieval tests with relevant, irrelevant, conflicting, and missing-policy cases;
- citation validity and applicability evaluation;
- preserved evidence snapshot for every proposal;
- refusal/escalation when required evidence is absent or conflicting.

## 12. Human approval and governance

Approval is a record, not a Boolean.

It includes:

- reviewer identity and authority;
- decision and reason;
- proposal and evidence versions;
- reservation/lock and expiry;
- risk triggers;
- timestamp and invalidation reason.

Approval is required for:

- refund above configured threshold;
- ambiguous or conflicting policy;
- missing booking data;
- VIP or sensitive-customer rules;
- low retrieval quality;
- non-idempotent or high-impact action.

Backend authorization must enforce these rules. Frontend controls are presentation only.

## 13. Reliability and recovery

### Required execution states

```text
queued
running
waiting_approval
completed_verified
failed_no_side_effect
execution_uncertain
reconciling
escalated
```

### Recovery matrix

| Outcome | Side-effect knowledge | Allowed action |
|---|---|---|
| Validation rejected | None | Correct and retry |
| Provider rejected before acceptance | None | Safe retry |
| Timeout before request sent | None | Safe retry |
| Timeout after request acceptance | Possible | Reconcile first |
| Receipt returned, postcondition missing | Confirmed/partial | Verify or compensate |
| Policy/approval became stale | No new action allowed | Re-review |

Required controls:

- idempotency keys and uniqueness constraints;
- bounded retries with exponential backoff;
- dead-letter handling for exhausted background work;
- reconciliation by external reference and idempotency key;
- prior attempts retained;
- no silent provider/model fallback;
- chaos/failure tests for timeout, duplicate delivery, stale approval, and worker restart.

## 14. Backend API

```text
/api/tasks
/api/tasks/{id}
/api/agent-runs
/api/agent-runs/{id}
/api/approvals
/api/policies
/api/tools
/api/evaluations
/api/health/live
/api/health/ready
```

Requirements:

- OpenAPI generated from typed contracts;
- authentication and role-based authorization;
- idempotent command endpoints;
- pagination and filtering;
- optimistic concurrency/version checks;
- stable error taxonomy and correlation IDs;
- database migrations;
- no provider or model secrets returned to the frontend.

## 15. Security and private deployment

Minimum controls:

- OIDC-compatible authentication;
- RBAC for operator, supervisor, auditor, and administrator;
- secrets supplied by environment/secret store;
- PII classification and log redaction;
- prompt-injection boundary between retrieved text and system instructions;
- outbound network allowlist for tool adapters;
- audit events for decisions and consequential actions;
- dependency, container, and secret scanning in CI;
- threat model covering prompt injection, tool misuse, data leakage, privilege escalation, replay,
  and duplicate execution;
- optional private/on-prem Compose profile using a local model endpoint and internal API gateway.

## 16. Observability and audit

Each task, run, model call, retrieval, approval, tool attempt, and postcondition check shares a
correlation ID.

Capture:

- structured application logs;
- distributed traces;
- workflow/node duration;
- queue latency;
- model latency, tokens, cost, and errors when available;
- retrieval coverage and citation validity;
- tool retry/reconciliation counts;
- approval wait time;
- verified completion and unsafe-action indicators.

Audit events are append-only business records. OpenTelemetry spans are diagnostic evidence; they do
not replace the audit log.

Dashboards and alerts must be derived from captured telemetry. No static “healthy” or production SLO
claim is permitted.

## 17. Evaluation and release gates

Evaluation uses separate sources:

```text
versioned golden expectation
        +
observed workflow output
        ↓
deterministic and model-assisted evaluators
        ↓
case result + failed checks + impact + disposition
```

Dataset coverage:

- valid happy path;
- missing data;
- irrelevant citation;
- conflicting policy;
- stale approval;
- provider rejection;
- timeout with possible side effect;
- duplicate delivery;
- incorrect tool choice;
- postcondition failure.

Release gates:

- schema/contract tests;
- graph transition tests;
- tool integration tests;
- RAG retrieval/citation tests;
- approval and authorization tests;
- failure/recovery tests;
- offline evaluation threshold;
- migration test;
- container smoke test;
- security scan;
- frontend E2E and accessibility tests.

Every metric links to underlying cases. Failed cases state impact, safety disposition, and next action.

## 18. Deployment and operations

Containerization begins early as a development contract. The first Compose environment contains only
frontend, API, and PostgreSQL/pgvector. Docker Compose is the verified local runtime; Containerfiles
and Compose configuration remain OCI-compatible and portable to Podman.

The production-packaging phase later extends the proven environment with:

```text
frontend
api
worker
postgres
redis
otel-collector
provider-simulator
optional-local-model
```

CI pipeline:

```text
format/lint
→ type-check
→ unit tests
→ integration tests
→ evaluation
→ build images
→ vulnerability scan
→ Compose smoke test
→ publish evidence artifact
```

Operational documentation:

- local setup;
- configuration and secrets;
- database migration and rollback;
- policy ingestion;
- model/provider switching;
- failure triage and reconciliation;
- backup/restore;
- incident and deployment runbooks;
- known limitations.

## 19. Enterprise integration boundaries

These are narrow proof adapters, not new product surfaces:

- **n8n:** inbound task webhook and escalation notification workflow.
- **MCP:** optional read-only policy/booking tool adapter after native tool contracts are stable.
- **API gateway:** documented authentication, rate-limit, and correlation-header contract.
- **NiFi/lakehouse:** documented batch-ingestion contract for policy/evaluation data; no bundled data
  platform.
- **OpenWebUI/LibreChat:** documented model-gateway compatibility only; not the TravelOps operator UI.

One working n8n webhook flow is sufficient. The other boundaries require an ADR and contract test only
when they materially support the refund workflow.

## 20. Repository structure target

```text
frontend/
backend/
  app/
    api/
    domain/
    orchestration/
    retrieval/
    tools/
    services/
    observability/
  tests/
policies/
evaluations/
infra/
  compose/
  otel/
  gateway/
.github/workflows/
docs/
  adr/
  architecture/
  prompts/
  runbooks/
  security/
```

## 21. Delivery sequence

### Phase A — Backend foundation

FastAPI, Pydantic contracts, PostgreSQL migrations, health endpoints, typed repository layer, an early
OCI development environment, and the frontend API boundary.

### Phase B — Real agent vertical slice

LangGraph refund graph, model gateway, typed booking/policy/refund tools, durable state, and provider
simulator.

### Phase C — RAG and approval

Policy ingestion, pgvector retrieval, applicability validation, versioned evidence, persisted approval,
and backend authority enforcement.

### Phase D — Reliable execution

Worker queue, idempotency, retries, uncertain outcomes, reconciliation, audit events, and restart tests.

### Phase E — Evaluation and observability

Golden dataset, observed run exports, release evaluation, OpenTelemetry, operational metrics, and
failure triage.

### Phase F — Production packaging and security

Hardened multi-stage OCI images, release Compose profile, CI/CD, OIDC/RBAC, secrets, redaction, scans,
threat model, runbooks, and optional private model profile. This phase productionizes the container
contract; it does not introduce containers for the first time.

### Phase G — Focused enterprise adapter

One n8n workflow plus documented MCP, gateway, and enterprise-data integration boundaries.

## 22. Definition of done

The flagship repository is complete only when:

1. A fresh clone starts through the documented Docker Compose command, with OCI/Podman portability
   retained.
2. A refund request completes through real backend orchestration.
3. Policy evidence is retrieved from a versioned vector index and cited.
4. High-risk execution is blocked until valid approval.
5. Tool execution is idempotent and its postcondition is verified.
6. An accepted-request timeout produces `execution_uncertain`, blocks blind retry, and reconciles.
7. State survives API/worker restart.
8. Golden expectations are evaluated against observed workflow outputs.
9. Traces, structured logs, metrics, audit events, and correlation IDs can be inspected.
10. CI executes tests, evaluation, image build, scans, and a container smoke test.
11. Security boundaries and operational runbooks are documented and tested where automatable.
12. Technical Evidence displays only claims backed by generated artifacts.

## 23. Requirement alignment

| ATI requirement | Repository proof target |
|---|---|
| Agentic AI and multi-step workflow | Durable LangGraph refund graph |
| LLM/tool/API/database integration | Model gateway, typed tools, FastAPI, PostgreSQL |
| RAG, embeddings, vector database | Versioned policy ingestion and pgvector retrieval |
| Python, Node.js, JavaScript | FastAPI backend and Next.js frontend |
| Retry, fallback, exception handling | Recovery matrix, worker retries, reconciliation tests |
| Docker and CI/CD | Compose deployment and GitHub Actions release gate |
| Evaluation and model lifecycle | Golden dataset versus observed output with version metadata |
| Observability and auditability | OpenTelemetry plus append-only audit events |
| Security and governance | OIDC/RBAC, redaction, threat model, scans, approval enforcement |
| n8n/equivalent | One webhook-driven automation flow |
| Private/on-prem AI | Optional vLLM-compatible Compose profile |
| MoE and visual models | Documented capability routing; visual extension only if justified |
| Big Data/lakehouse exposure | Ingestion contract and ADR, not a fake bundled platform |
| OpenWebUI/LibreChat familiarity | Model-gateway compatibility note, not product UI |
| Technical documentation | ADRs, prompt/tool docs, deployment and incident runbooks |

## Final principle

> Build one refund workflow deeply enough that every important claim can be demonstrated, failed,
> recovered, measured, and inspected.

The project exceeds the job requirement through evidence quality, failure handling, and operational
discipline—not through feature count or architecture theater.
