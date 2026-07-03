from datetime import UTC, datetime

from app.config import Settings
from app.domain.runs import AgentRunCreate
from app.domain.tasks import RequestChannel, TaskCreate
from app.persistence.database import Database
from app.persistence.repositories import TaskRepository
from app.services.run_service import RunService
from app.services.task_service import TaskService


def main() -> None:
    settings = Settings()
    if not settings.database_url:
        raise RuntimeError("TRAVELOPS_DATABASE_URL is required to seed demo data.")

    database = Database(settings.database_url)
    try:
        with database.session() as session:
            existing = TaskRepository(session).get_by_public_id("RF-1042")
        if existing:
            print("Demo task RF-1042 already exists; no changes made.")
            return

        task, _ = TaskService(database).create_task(
            TaskCreate(
                public_id="RF-1042",
                customer_message=(
                    "Customer requests a refund after the airline cancelled the flight."
                ),
                channel=RequestChannel.EMAIL,
                received_at=datetime(2026, 7, 3, 9, 0, tzinfo=UTC),
                correlation_id="corr_demo_rf_1042",
            )
        )
        RunService(database).create_run(
            AgentRunCreate(
                public_id="AR-8821",
                task_id=task.id,
                correlation_id="corr_demo_rf_1042",
            )
        )
        print("Created labelled demo task RF-1042 and run AR-8821.")
    finally:
        database.dispose()


if __name__ == "__main__":
    main()
