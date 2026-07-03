from datetime import UTC, datetime, timedelta
from decimal import Decimal

from sqlalchemy import select

from app.config import Settings
from app.domain.runs import AgentRunCreate
from app.domain.tasks import RequestChannel, TaskCreate
from app.persistence.database import Database
from app.persistence.models import BookingSnapshotModel, CustomerSnapshotModel, TaskModel
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
        if existing is None:
            task, _ = TaskService(database).create_task(
                TaskCreate(
                    public_id="RF-1042",
                    customer_message=(
                        "My flight was cancelled by the airline. Please refund the full amount "
                        "to my original payment method."
                    ),
                    channel=RequestChannel.EMAIL,
                    received_at=datetime.now(UTC),
                    correlation_id="corr_demo_rf_1042",
                    summary="Flight cancelled by carrier",
                    due_at=datetime.now(UTC) + timedelta(minutes=18),
                    exposure_amount=Decimal("284.00"),
                    exposure_currency="USD",
                )
            )
            RunService(database).create_run(
                AgentRunCreate(
                    public_id="AR-8821",
                    task_id=task.id,
                    correlation_id="corr_demo_rf_1042",
                )
            )
        else:
            task = existing

        with database.session() as session:
            task_model = session.scalar(select(TaskModel).where(TaskModel.id == task.id))
            if task_model is None:
                raise RuntimeError("Demo task disappeared during seed.")
            task_model.summary = "Flight cancelled by carrier"
            task_model.due_at = datetime.now(UTC) + timedelta(minutes=18)
            task_model.exposure_amount = Decimal("284.00")
            task_model.exposure_currency = "USD"

            customer = session.scalar(
                select(CustomerSnapshotModel).where(CustomerSnapshotModel.task_id == task.id)
            )
            if customer is None:
                session.add(
                    CustomerSnapshotModel(
                        task_id=task.id,
                        customer_id="CUS-88214",
                        name="Maria Santos",
                        tier="vip",
                        locale="en-SG",
                        contact="maria.santos@example.com",
                    )
                )

            booking = session.scalar(
                select(BookingSnapshotModel).where(BookingSnapshotModel.task_id == task.id)
            )
            if booking is None:
                session.add(
                    BookingSnapshotModel(
                        task_id=task.id,
                        reference="BA218",
                        service_date_label="14 Jul",
                        status="cancelled",
                        provider="British Airways",
                        itinerary="Singapore (SIN) → London (LHR)",
                        passengers=1,
                        paid_amount=Decimal("284.00"),
                        currency="USD",
                    )
                )
        print("Demo task RF-1042 context is present and current.")
    finally:
        database.dispose()


if __name__ == "__main__":
    main()
