# TravelOps Backend

Status: Backend Sprint 6 durable agent orchestration implemented.

The backend will be a Python 3.12 FastAPI modular monolith. PostgreSQL owns durable business and
workflow state. Redis will be introduced only when asynchronous execution requires it.

## Local setup

The project uses Python 3.12 managed through `uv`. If `uv` is not yet on the PowerShell `PATH`, use
`python -m uv` as shown below:

```powershell
cd backend
python -m uv sync --frozen
python -m uv run uvicorn app.main:app --reload --port 8000
```

Open:

```text
http://127.0.0.1:8000/api/health/live
http://127.0.0.1:8000/api/health/ready
http://127.0.0.1:8000/api/tasks
http://127.0.0.1:8000/api/tasks/RF-1042
http://127.0.0.1:8000/api/agent-runs/{run_id}
http://127.0.0.1:8000/api/tasks/RF-1042/proposals/1
http://127.0.0.1:8000/docs
```

## Verification

```powershell
python -m uv run ruff check .
python -m uv run ruff format --check .
python -m uv run mypy app tests
python -m uv run pytest
```

PostgreSQL integration tests require a separate test database:

```powershell
$env:TEST_DATABASE_URL = "postgresql+psycopg://travelops:travelops@127.0.0.1:55432/travelops_test"
python -m uv run pytest
Remove-Item Env:TEST_DATABASE_URL
```

Readiness intentionally reports PostgreSQL as `not_configured`. Database persistence begins only
without `TRAVELOPS_DATABASE_URL`. With a configured and reachable PostgreSQL database it reports
`healthy`; an unavailable required database returns `503`.

## Database migration

Set `TRAVELOPS_DATABASE_URL`, then run:

```powershell
python -m uv run alembic upgrade head
python -m uv run python scripts/setup_checkpoints.py
```

Rollback one migration only during a reviewed rollback procedure:

```powershell
python -m uv run alembic downgrade -1
```

Seed the deterministic, explicitly labelled demo task:

```powershell
python -m uv run python scripts/seed_demo.py
```

The seed is idempotent. Start the deterministic refund graph with:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8000/api/tasks/RF-1042/agent-runs `
  -ContentType application/json `
  -Body '{}'
```

Provider tools remain internal application contracts; no public simulator mutation endpoint is
exposed. Redis, live policy retrieval, approval mutation, and real provider credentials remain
outside the current runtime.
