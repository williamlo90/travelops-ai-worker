# TravelOps Backend

Status: Backend Sprint 1 foundation implemented.

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
http://127.0.0.1:8000/docs
```

## Verification

```powershell
python -m uv run ruff check .
python -m uv run ruff format --check .
python -m uv run mypy app tests
python -m uv run pytest
```

Readiness intentionally reports PostgreSQL as `not_configured`. Database persistence begins only
after Backend Sprint 2 is approved. Redis, LangGraph, provider tools, and Compose are also out of the
current runtime.
