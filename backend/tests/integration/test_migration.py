from sqlalchemy import inspect

from app.persistence.database import Database


def test_migration_creates_only_approved_core_tables(database: Database) -> None:
    tables = set(inspect(database.engine).get_table_names())

    assert {
        "alembic_version",
        "tasks",
        "requests",
        "agent_runs",
        "audit_events",
        "booking_snapshots",
        "customer_snapshots",
        "tool_attempts",
        "external_receipts",
    } <= tables
    assert "bookings" not in tables
    assert "customers" not in tables
