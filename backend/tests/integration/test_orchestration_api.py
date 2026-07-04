from datetime import UTC, datetime
from decimal import Decimal

from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.config import Settings
from app.domain.proposals import IntentClassification
from app.domain.tasks import RequestChannel, TaskCreate
from app.main import create_app
from app.models.deterministic import DeterministicModelGateway
from app.models.gateway import ClassificationRequest
from app.persistence.database import Database
from app.persistence.models import (
    BookingSnapshotModel,
    CustomerSnapshotModel,
    ProposalVersionModel,
    RiskDecisionModel,
)
from app.services.task_service import TaskService


class CountingGateway(DeterministicModelGateway):
    def __init__(self) -> None:
        self.calls = 0

    def classify(self, request: ClassificationRequest) -> IntentClassification:
        self.calls += 1
        return super().classify(request)


def seed_context(database: Database) -> None:
    task, _ = TaskService(database).create_task(
        TaskCreate(
            public_id="RF-1042",
            summary="Refund cancelled flight",
            customer_message="The airline cancelled my flight. Please refund it.",
            channel=RequestChannel.EMAIL,
            received_at=datetime(2026, 7, 4, 9, 0, tzinfo=UTC),
            correlation_id="corr_orchestration_test",
            exposure_amount=Decimal("284.00"),
            exposure_currency="USD",
        )
    )
    with database.session() as session:
        session.add_all(
            [
                CustomerSnapshotModel(
                    task_id=task.id,
                    customer_id="CUS-2048",
                    name="Maya Chen",
                    tier="standard",
                    locale="en-SG",
                    contact="maya@example.test",
                ),
                BookingSnapshotModel(
                    task_id=task.id,
                    reference="BA218",
                    service_date_label="14 Jul",
                    status="cancelled",
                    provider="British Airways",
                    itinerary="SIN to LHR",
                    passengers=1,
                    paid_amount=Decimal("284.00"),
                    currency="USD",
                ),
            ]
        )


def test_start_resume_and_read_persisted_proposal(
    database: Database, test_database_url: str
) -> None:
    seed_context(database)
    app = create_app(Settings(environment="test", database_url=test_database_url, _env_file=None))
    gateway = CountingGateway()
    app.state.model_gateway = gateway

    with TestClient(app) as client:
        started = client.post(
            "/api/tasks/RF-1042/agent-runs",
            json={},
            headers={"X-Correlation-ID": "corr-api-orchestration"},
        )
        assert started.status_code == 201
        body = started.json()
        run_id = body["run"]["public_id"]
        assert body["run"]["status"] == "running"
        assert body["run"]["model_provider"] == "deterministic"
        assert body["proposal"]["status"] == "draft_waiting_evidence"
        assert body["proposal"]["parameters"]["booking_reference"] == "BA218"

        resumed = client.post(
            "/api/tasks/RF-1042/agent-runs",
            json={"run_id": run_id},
        )
        assert resumed.status_code == 201
        assert resumed.json()["proposal"]["id"] == body["proposal"]["id"]
        assert gateway.calls == 1

        run_response = client.get(f"/api/agent-runs/{run_id}")
        proposal_response = client.get("/api/tasks/RF-1042/proposals/1")
        assert run_response.status_code == 200
        assert proposal_response.status_code == 200
        assert proposal_response.json()["data"]["graph_version"] == "refund-graph-v1"

    with database.session() as session:
        assert session.scalar(select(func.count()).select_from(ProposalVersionModel)) == 1
        assert session.scalar(select(func.count()).select_from(RiskDecisionModel)) == 1


def test_missing_task_and_resources_return_stable_errors(
    database: Database, test_database_url: str
) -> None:
    app = create_app(Settings(environment="test", database_url=test_database_url, _env_file=None))

    with TestClient(app) as client:
        assert client.post("/api/tasks/RF-9999/agent-runs", json={}).status_code == 404
        assert client.get("/api/agent-runs/AR-MISSING").status_code == 404
        assert client.get("/api/tasks/RF-9999/proposals/1").status_code == 404
