from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.domain.audit import AuditEventRecord
from app.domain.runs import AgentRunCreate, AgentRunRecord, RunStatus
from app.domain.tasks import RequestRecord, TaskCreate, TaskRecord
from app.persistence.models import (
    AgentRunModel,
    AuditEventModel,
    RequestModel,
    TaskModel,
    utc_now,
)


class RecordNotFound(LookupError):
    pass


class ConcurrencyConflict(RuntimeError):
    pass


class TaskRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(self, command: TaskCreate) -> tuple[TaskRecord, RequestRecord]:
        task = TaskModel(
            public_id=command.public_id,
            task_type=command.task_type.value,
            status=RunStatus.QUEUED.value,
        )
        request = RequestModel(
            task=task,
            channel=command.channel.value,
            customer_message=command.customer_message,
            received_at=command.received_at,
            correlation_id=command.correlation_id,
        )
        self.session.add_all([task, request])
        self.session.flush()
        return TaskRecord.model_validate(task), RequestRecord.model_validate(request)

    def get_by_public_id(self, public_id: str) -> TaskRecord | None:
        model = self.session.scalar(select(TaskModel).where(TaskModel.public_id == public_id))
        return TaskRecord.model_validate(model) if model else None


class RunRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(self, command: AgentRunCreate) -> AgentRunRecord:
        run = AgentRunModel(
            public_id=command.public_id,
            task_id=command.task_id,
            status=RunStatus.QUEUED.value,
            correlation_id=command.correlation_id,
        )
        self.session.add(run)
        self.session.flush()
        return AgentRunRecord.model_validate(run)

    def get_by_public_id(self, public_id: str) -> AgentRunRecord | None:
        model = self.session.scalar(
            select(AgentRunModel).where(AgentRunModel.public_id == public_id)
        )
        return AgentRunRecord.model_validate(model) if model else None

    def transition(
        self,
        *,
        run_id: UUID,
        expected_version: int,
        target: RunStatus,
    ) -> AgentRunRecord:
        statement = (
            update(AgentRunModel)
            .where(
                AgentRunModel.id == run_id,
                AgentRunModel.version == expected_version,
            )
            .values(
                status=target.value,
                version=AgentRunModel.version + 1,
                updated_at=utc_now(),
            )
            .returning(AgentRunModel)
        )
        updated = self.session.scalar(statement)
        if updated is None:
            exists = self.session.scalar(select(AgentRunModel.id).where(AgentRunModel.id == run_id))
            if exists is None:
                raise RecordNotFound(f"Agent run {run_id} does not exist.")
            raise ConcurrencyConflict(
                f"Agent run {run_id} is not at expected version {expected_version}."
            )
        return AgentRunRecord.model_validate(updated)


class AuditRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(
        self,
        *,
        task_id: UUID,
        run_id: UUID | None,
        event_type: str,
        actor_type: str,
        data: dict[str, str | int],
        correlation_id: str,
    ) -> AuditEventRecord:
        model = AuditEventModel(
            task_id=task_id,
            run_id=run_id,
            event_type=event_type,
            actor_type=actor_type,
            data=data,
            correlation_id=correlation_id,
        )
        self.session.add(model)
        self.session.flush()
        return AuditEventRecord.model_validate(model)

    def list_for_task(self, task_id: UUID) -> list[AuditEventRecord]:
        models = self.session.scalars(
            select(AuditEventModel)
            .where(AuditEventModel.task_id == task_id)
            .order_by(AuditEventModel.occurred_at, AuditEventModel.id)
        )
        return [AuditEventRecord.model_validate(model) for model in models]
