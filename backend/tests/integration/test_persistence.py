from datetime import UTC, datetime

import pytest
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from app.domain.runs import AgentRunCreate, RunStatus
from app.domain.tasks import RequestChannel, TaskCreate
from app.persistence.database import Database
from app.persistence.models import AuditEventModel
from app.persistence.repositories import AuditRepository, ConcurrencyConflict, TaskRepository
from app.services.run_service import RunService
from app.services.task_service import TaskService


def task_command(public_id: str = "RF-1042") -> TaskCreate:
    return TaskCreate(
        public_id=public_id,
        customer_message="Customer requests a refund for a cancelled flight.",
        channel=RequestChannel.EMAIL,
        received_at=datetime(2026, 7, 3, 9, 0, tzinfo=UTC),
        correlation_id="corr_persistence_test",
    )


def test_task_request_and_audit_commit_together(database: Database) -> None:
    task, request = TaskService(database).create_task(task_command())

    assert request.task_id == task.id
    with database.session() as session:
        persisted = TaskRepository(session).get_by_public_id("RF-1042")
        audit_events = AuditRepository(session).list_for_task(task.id)

    assert persisted == task
    assert len(audit_events) == 1
    assert audit_events[0].event_type == "task.created"
    assert audit_events[0].data == {"public_id": "RF-1042", "version": 1}


def test_transaction_rolls_back_all_writes(database: Database) -> None:
    with pytest.raises(IntegrityError), database.session() as session:
        repository = TaskRepository(session)
        repository.add(task_command())
        repository.add(task_command())

    with database.session() as session:
        assert TaskRepository(session).get_by_public_id("RF-1042") is None
        assert session.scalar(select(func.count()).select_from(AuditEventModel)) == 0


def test_stale_run_transition_fails_and_does_not_add_audit(database: Database) -> None:
    task, _ = TaskService(database).create_task(task_command())
    service = RunService(database)
    run = service.create_run(
        AgentRunCreate(
            public_id="AR-8821",
            task_id=task.id,
            correlation_id="corr_persistence_test",
        )
    )
    updated = service.transition(
        public_id=run.public_id,
        expected_version=1,
        target=RunStatus.RUNNING,
    )

    with pytest.raises(ConcurrencyConflict):
        service.transition(
            public_id=run.public_id,
            expected_version=1,
            target=RunStatus.WAITING_APPROVAL,
        )

    assert updated.version == 2
    with database.session() as session:
        audit_count = session.scalar(
            select(func.count())
            .select_from(AuditEventModel)
            .where(AuditEventModel.run_id == run.id)
        )
    assert audit_count == 2


def test_persisted_task_survives_database_object_restart(
    database: Database, test_database_url: str
) -> None:
    created, _ = TaskService(database).create_task(task_command())
    database.dispose()

    restarted = Database(test_database_url)
    try:
        with restarted.session() as session:
            reloaded = TaskRepository(session).get_by_public_id(created.public_id)
    finally:
        restarted.dispose()

    assert reloaded == created


def test_missing_run_transition_fails_without_audit(database: Database) -> None:
    with pytest.raises(LookupError):
        RunService(database).transition(
            public_id="AR-9999",
            expected_version=1,
            target=RunStatus.RUNNING,
        )
