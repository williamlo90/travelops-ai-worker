# TravelOps Backend

Status: Contract only. Backend Sprint 1 has not started.

The backend will be a Python 3.12 FastAPI modular monolith. PostgreSQL owns durable business and
workflow state. Redis will be introduced only when asynchronous execution requires it.

## Planned local commands

These commands become executable in their owning sprint:

```powershell
uv sync --frozen
uv run uvicorn app.main:app --reload --port 8000
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy app tests
```

Database migration begins in Backend Sprint 2:

```powershell
uv run alembic upgrade head
```

The Podman Compose development stack begins in Backend Sprint 3:

```powershell
podman compose -f compose.dev.yaml up --build
```

Do not add backend scaffolding until Backend Sprint 1 is explicitly approved.

