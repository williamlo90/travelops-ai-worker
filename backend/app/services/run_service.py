from app.domain.runs import (
    AgentRunCreate,
    AgentRunRecord,
    RunStatus,
    validate_run_transition,
)
from app.persistence.database import Database
from app.persistence.repositories import AuditRepository, RunRepository


class RunService:
    def __init__(self, database: Database) -> None:
        self.database = database

    def create_run(self, command: AgentRunCreate) -> AgentRunRecord:
        with self.database.session() as session:
            run = RunRepository(session).add(command)
            AuditRepository(session).add(
                task_id=run.task_id,
                run_id=run.id,
                event_type="agent_run.created",
                actor_type="system",
                data={"public_id": run.public_id, "version": run.version},
                correlation_id=run.correlation_id,
            )
            return run

    def transition(
        self,
        *,
        public_id: str,
        expected_version: int,
        target: RunStatus,
        actor_type: str = "system",
    ) -> AgentRunRecord:
        with self.database.session() as session:
            repository = RunRepository(session)
            current = repository.get_by_public_id(public_id)
            if current is None:
                raise LookupError(f"Agent run {public_id} does not exist.")
            validate_run_transition(current.status, target)
            updated = repository.transition(
                run_id=current.id,
                expected_version=expected_version,
                target=target,
            )
            AuditRepository(session).add(
                task_id=updated.task_id,
                run_id=updated.id,
                event_type="agent_run.transitioned",
                actor_type=actor_type,
                data={
                    "from_status": current.status.value,
                    "to_status": target.value,
                    "from_version": expected_version,
                    "to_version": updated.version,
                },
                correlation_id=updated.correlation_id,
            )
            return updated
