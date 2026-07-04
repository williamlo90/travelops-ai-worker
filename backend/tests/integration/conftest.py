import os
from collections.abc import Iterator

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import text

from app.persistence.checkpoints import setup_checkpoint_schema
from app.persistence.database import Database


@pytest.fixture(scope="session")
def test_database_url() -> str:
    value = os.getenv("TEST_DATABASE_URL")
    if not value:
        pytest.skip("TEST_DATABASE_URL is required for PostgreSQL integration tests.")
    return value


@pytest.fixture(scope="session")
def migrated_database(test_database_url: str) -> Iterator[None]:
    previous = os.environ.get("TRAVELOPS_DATABASE_URL")
    os.environ["TRAVELOPS_DATABASE_URL"] = test_database_url
    config = Config("alembic.ini")
    command.downgrade(config, "base")
    command.upgrade(config, "head")
    setup_checkpoint_schema(test_database_url)
    try:
        yield
    finally:
        if previous is None:
            os.environ.pop("TRAVELOPS_DATABASE_URL", None)
        else:
            os.environ["TRAVELOPS_DATABASE_URL"] = previous


@pytest.fixture
def database(test_database_url: str, migrated_database: None) -> Iterator[Database]:
    database = Database(test_database_url)
    with database.session() as session:
        session.execute(
            text("TRUNCATE audit_events, agent_runs, requests, tasks RESTART IDENTITY CASCADE")
        )
    try:
        yield database
    finally:
        database.dispose()
