# Backend Sprint 3 Review

Status: Engineering review complete; Docker Compose accepted as the verified development runtime.
Awaiting human approval for Backend Sprint 4.

## Goal

Provide one consistent OCI Compose development environment for the existing frontend, FastAPI API,
and PostgreSQL/pgvector.

## Delivered

- OCI-compatible frontend and backend Containerfiles.
- Non-root application users (`node` and `travelops`).
- One `compose.dev.yaml` with exactly three services: frontend, API, and PostgreSQL/pgvector.
- Named PostgreSQL volume.
- Real service healthchecks and dependency ordering.
- Narrow source mounts without host `node_modules` or `.venv`.
- Development-only automatic migration and idempotent seed.
- Root `.env.example` with local defaults.
- Docker/Podman-compatible PowerShell smoke harness.
- Development container runbook.
- Explicit LF policy for shell entrypoints.

## Docker verification

```text
Compose config validation: passed
Clean-cache API image build: passed
Clean-cache frontend image build: passed
PostgreSQL/pgvector health: passed
API readiness: passed
Frontend /tasks: passed
API runtime user: uid 10001 (travelops)
Frontend runtime user: uid 1000 (node)
pgvector available version: 0.8.4
Stack stop/start: passed
RF-1042 after restart: exactly one persisted row
Frontend lint: passed
Frontend type-check: passed
Frontend tests: 29 passed
```

The Docker Compose smoke test completed successfully:

```text
Container smoke passed with docker; RF-1042 survived restart.
```

## Podman verification

Actions completed:

- Downloaded the official Podman Windows v6.0.0 MSI.
- Verified SHA-256:
  `0e857dc5ab565492fe98a346b5958fe41034e5893805f96e9c086394e65d517c`.
- Installed the Podman CLI successfully.
- Initialized `podman-machine-default` as a rootless WSL2 machine with 2 CPU, 4 GiB memory, and
  30 GiB disk.

Runtime verification did not pass:

```text
Podman machine start:
CreateFile \\.\pipe\podman-machine-default: All pipe instances are busy.

Direct Podman command inside the WSL machine:
Cgroups v1 not supported
```

Changing the user's global WSL configuration and restarting every WSL distribution may resolve the
cgroups requirement, but that would also affect Docker Desktop. The user accepted Docker Compose as
the verified development runtime, so this host change is no longer a Sprint 3 acceptance requirement.

## Decisions and trade-offs

- Docker Compose evidence proves the application images, Compose contract, persistence, and health
  behavior.
- It does not prove Podman runtime compatibility on this host.
- The development API may migrate and seed because this is an explicitly flagged local profile.
  Production packaging must use a separate migration step.
- pgvector is available in the database image but is not enabled or used before the RAG sprint.
- Images prioritize reproducibility and development reload over size optimization.

## Rejected scope

- Redis and worker.
- Provider simulator.
- LangGraph.
- Reverse proxy and OTel collector.
- CI and release images.
- Kubernetes or cloud deployment.
- Global WSL configuration changes without approval.

## Known limitations

- Podman is installed but its machine is not operational on the current cgroups configuration.
- Docker Compose is the accepted runtime and the only runtime with executed end-to-end evidence.
- Frontend still uses its mock repository until Backend Sprint 4.
- Development credentials must never be reused for deployment.

## Review verdict

The OCI development environment is fully executable and verified with Docker Compose. The user
accepted Docker Compose as the local runtime while retaining OCI/Podman portability as a documented
compatibility target. Backend Sprint 3 meets its revised Definition of Done; Backend Sprint 4 remains
subject to the normal human approval gate.
