# Development Containers

Status: Backend Sprint 3 development contract.

The development stack contains exactly three services:

```text
frontend → api → postgres/pgvector
```

Podman is the primary documented runtime. The same OCI Containerfiles and Compose Specification are
also verified with Docker Compose.

## Start with Podman

Podman on Windows requires its WSL2-backed machine:

```powershell
podman machine init
podman machine start
podman compose -f compose.dev.yaml up --build
```

On the current development workstation, Podman machine startup remains blocked by the host WSL
cgroups configuration. Docker Compose is the executed runtime evidence until that host-level decision
is resolved; see the Backend Sprint 3 review.

Open:

```text
http://127.0.0.1:3000/tasks
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/api/health/ready
```

## Docker-compatible command

```powershell
docker compose -f compose.dev.yaml up --build
```

## What startup does

The development API entrypoint waits for healthy PostgreSQL through Compose dependency ordering, runs
`alembic upgrade head`, idempotently seeds labelled demo records, and starts Uvicorn. This behavior is
enabled only by `TRAVELOPS_DEV_MIGRATE` and `TRAVELOPS_DEV_SEED` in `compose.dev.yaml`; it is not the
future production deployment strategy.

Source mounts are intentionally narrow:

- `backend/app`, migrations, and scripts;
- `frontend/src` and public assets.

Dependencies remain inside images, avoiding host `node_modules` or `.venv` coupling.

## Verification

Docker:

```powershell
.\scripts\container-smoke.ps1 -Runtime docker
```

Podman:

```powershell
.\scripts\container-smoke.ps1 -Runtime podman
```

The smoke test builds the images, waits for real readiness, verifies the frontend, stops and restarts
the stack, and confirms `RF-1042` remains in PostgreSQL.

## Stop

Preserve development data:

```powershell
podman compose -f compose.dev.yaml down
```

Delete development data only when deliberately resetting the demo:

```powershell
podman compose -f compose.dev.yaml down --volumes
```

Use the equivalent `docker compose` commands when Docker is the selected runtime.

## Boundaries

- Local credentials are safe development defaults, not deployment secrets.
- PostgreSQL is bound to loopback only.
- No Redis, worker, LangGraph, provider simulator, reverse proxy, or telemetry collector exists yet.
- This stack is development infrastructure and is not a production-readiness claim.
