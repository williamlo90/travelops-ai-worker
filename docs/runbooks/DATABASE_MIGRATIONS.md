# Database Migration and Rollback

Status: Backend Sprint 2 local-development runbook.

## Preconditions

- `TRAVELOPS_DATABASE_URL` points to the intended PostgreSQL database.
- The application version and migration revision are reviewed together.
- For a non-disposable environment, take and verify a database backup before a destructive change.

Never print the database URL in evidence or logs because it may contain credentials.

## Inspect and upgrade

From `backend/`:

```powershell
python -m uv run alembic current
python -m uv run alembic upgrade head
python -m uv run alembic check
```

Then confirm:

```text
GET /api/health/ready → 200
database.status        → healthy
```

Application workers must not run migrations automatically during startup.

## Roll back

Use rollback only after reviewing the migration's `downgrade()` and the data-loss impact:

```powershell
python -m uv run alembic downgrade -1
python -m uv run alembic current
```

If a migration transforms or removes business data, prefer a forward corrective migration or restore
from a verified backup. A syntactically available downgrade does not guarantee lossless recovery.

## Sprint 2 scope

Revision `20260703_0001` creates only:

- `tasks`
- `requests`
- `agent_runs`
- `audit_events`

Booking, customer, policy, proposal, approval, and execution tables are intentionally absent.

