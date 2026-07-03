from app.domain.tasks import RequestRecord, TaskCreate, TaskRecord
from app.persistence.database import Database
from app.persistence.repositories import AuditRepository, TaskRepository


class TaskService:
    def __init__(self, database: Database) -> None:
        self.database = database

    def create_task(self, command: TaskCreate) -> tuple[TaskRecord, RequestRecord]:
        with self.database.session() as session:
            task, request = TaskRepository(session).add(command)
            AuditRepository(session).add(
                task_id=task.id,
                run_id=None,
                event_type="task.created",
                actor_type="system",
                data={"public_id": task.public_id, "version": task.version},
                correlation_id=command.correlation_id,
            )
            return task, request
