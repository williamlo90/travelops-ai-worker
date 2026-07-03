from datetime import UTC, datetime, timedelta
from decimal import Decimal

from fastapi.testclient import TestClient

from app.config import Settings
from app.domain.tasks import RequestChannel, TaskCreate
from app.main import create_app
from app.persistence.database import Database
from app.persistence.models import BookingSnapshotModel, CustomerSnapshotModel
from app.services.task_service import TaskService


def seed_context(
    database: Database,
    *,
    public_id: str = "RF-1042",
    customer_name: str = "Maria Santos",
    booking_reference: str = "BA218",
    exposure: str = "284.00",
    due_minutes: int = 18,
) -> None:
    task, _ = TaskService(database).create_task(
        TaskCreate(
            public_id=public_id,
            customer_message="Please refund my cancelled flight.",
            channel=RequestChannel.EMAIL,
            received_at=datetime.now(UTC),
            correlation_id="corr_task_api",
            summary="Flight cancelled by carrier",
            due_at=datetime.now(UTC) + timedelta(minutes=due_minutes),
            exposure_amount=Decimal(exposure),
            exposure_currency="USD",
        )
    )
    with database.session() as session:
        session.add_all(
            [
                CustomerSnapshotModel(
                    task_id=task.id,
                    customer_id=f"CUS-{public_id[-4:]}",
                    name=customer_name,
                    tier="vip",
                    locale="en-SG",
                    contact=f"{customer_name.lower().replace(' ', '.')}@example.com",
                ),
                BookingSnapshotModel(
                    task_id=task.id,
                    reference=booking_reference,
                    service_date_label="14 Jul",
                    status="cancelled",
                    provider="British Airways",
                    itinerary="Singapore to London",
                    passengers=1,
                    paid_amount=Decimal(exposure),
                    currency="USD",
                ),
            ]
        )


def make_client(test_database_url: str) -> TestClient:
    return TestClient(
        create_app(Settings(environment="test", database_url=test_database_url, _env_file=None))
    )


def test_task_list_contract_filters_persisted_context(
    database: Database, test_database_url: str
) -> None:
    seed_context(database)
    with make_client(test_database_url) as client:
        response = client.get("/api/tasks?query=Maria&status=needs_approval&limit=10")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["next_cursor"] is None
    assert body["meta"] == {"data_mode": "demo"}
    assert body["items"][0] == {
        "id": "RF-1042",
        "type": "refund",
        "summary": "Flight cancelled by carrier",
        "customer": {"name": "Maria Santos", "is_vip": True},
        "booking": {"reference": "BA218", "service_date_label": "14 Jul"},
        "status": "needs_approval",
        "due_in_minutes": body["items"][0]["due_in_minutes"],
        "exposure": {"amount": 284.0, "currency": "USD"},
    }


def test_task_detail_contract_and_not_found(database: Database, test_database_url: str) -> None:
    seed_context(database)
    with make_client(test_database_url) as client:
        found = client.get("/api/tasks/RF-1042")
        missing = client.get("/api/tasks/RF-9999")

    assert found.status_code == 200
    assert found.json()["data"]["booking"]["paid_amount"] == {
        "amount": 284.0,
        "currency": "USD",
    }
    assert found.json()["data"]["proposed_action"]["approval_required"] is True
    assert found.json()["data"]["request"]["received_at"].endswith("Z")
    assert all(item["timestamp"].endswith("Z") for item in found.json()["data"]["activity"])
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "task_not_found"


def test_task_list_rejects_invalid_cursor(database: Database, test_database_url: str) -> None:
    seed_context(database)
    with make_client(test_database_url) as client:
        response = client.get("/api/tasks?cursor=not-a-cursor")

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "invalid_cursor"


def test_task_list_paginates_and_sorts(database: Database, test_database_url: str) -> None:
    seed_context(database)
    seed_context(
        database,
        public_id="RF-1034",
        customer_name="Siti Rahma",
        booking_reference="GA412",
        exposure="196.00",
        due_minutes=24,
    )
    with make_client(test_database_url) as client:
        first = client.get("/api/tasks?type=refund&sort=exposure_desc&limit=1")
        cursor = first.json()["next_cursor"]
        second = client.get(f"/api/tasks?type=refund&sort=exposure_desc&limit=1&cursor={cursor}")
        empty = client.get("/api/tasks?query=does-not-exist")

    assert first.status_code == 200
    assert first.json()["items"][0]["id"] == "RF-1042"
    assert first.json()["total"] == 2
    assert cursor is not None
    assert second.json()["items"][0]["id"] == "RF-1034"
    assert second.json()["next_cursor"] is None
    assert empty.json()["items"] == []


def test_task_api_requires_database() -> None:
    settings = Settings(environment="test", _env_file=None)
    settings.database_url = None
    with TestClient(create_app(settings)) as client:
        response = client.get("/api/tasks")

    assert response.status_code == 503
    assert response.json()["error"]["code"] == "database_not_configured"
