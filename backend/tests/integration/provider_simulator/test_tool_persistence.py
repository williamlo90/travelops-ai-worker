from datetime import UTC, datetime
from decimal import Decimal

import pytest

from app.domain.runs import AgentRunCreate, AgentRunRecord
from app.domain.tasks import RequestChannel, TaskCreate
from app.integrations.provider_simulator import DeterministicProviderSimulator
from app.persistence.database import Database
from app.persistence.repositories import RunRepository
from app.persistence.tool_repositories import (
    ExternalReceiptRepository,
    ToolAttemptRepository,
)
from app.services.run_service import RunService
from app.services.task_service import TaskService
from app.services.tool_service import ToolService
from app.tools.contracts import ProviderScenario, RefundReceiptOutput, SideEffectState
from app.tools.errors import ProviderPreSendTimeout, ProviderRejected, ProviderTimeout
from app.tools.provider_tools import build_provider_tool_registry


def create_run(database: Database) -> AgentRunCreate:
    task, _ = TaskService(database).create_task(
        TaskCreate(
            public_id="RF-1042",
            customer_message="Refund my cancelled flight.",
            channel=RequestChannel.EMAIL,
            received_at=datetime(2026, 7, 4, 9, 0, tzinfo=UTC),
            correlation_id="corr_tool_test",
        )
    )
    command = AgentRunCreate(
        public_id="AR-8821",
        task_id=task.id,
        correlation_id="corr_tool_test",
    )
    RunService(database).create_run(command)
    return command


def get_run(database: Database, public_id: str) -> AgentRunRecord | None:
    with database.session() as session:
        return RunRepository(session).get_by_public_id(public_id)


def payload(scenario: ProviderScenario) -> dict[str, str]:
    return {
        "booking_reference": "BA218",
        "amount": "284.00",
        "currency": "USD",
        "idempotency_key": "refund-RF-1042-v1",
        "scenario": scenario.value,
    }


def test_success_persists_attempt_and_one_idempotent_receipt(database: Database) -> None:
    run_command = create_run(database)
    provider = DeterministicProviderSimulator()
    service = ToolService(database, build_provider_tool_registry(provider))
    run = get_run(database, run_command.public_id)
    assert run is not None

    first = service.invoke(
        run_id=run.id,
        tool_name="create_refund_request",
        payload=payload(ProviderScenario.SUCCESS),
    )
    second = service.invoke(
        run_id=run.id,
        tool_name="create_refund_request",
        payload=payload(ProviderScenario.REJECT_BEFORE_SIDE_EFFECT),
    )

    assert isinstance(first, RefundReceiptOutput)
    assert isinstance(second, RefundReceiptOutput)
    assert second.duplicate is True
    with database.session() as session:
        attempts = ToolAttemptRepository(session).list_for_run(run.id)
        receipt = ExternalReceiptRepository(session).get_by_idempotency_key(
            provider="deterministic_travel_provider",
            tool_name="create_refund_request",
            idempotency_key="refund-RF-1042-v1",
        )
    assert len(attempts) == 2
    assert all(item.side_effect_state is SideEffectState.CONFIRMED for item in attempts)
    assert receipt is not None
    assert receipt.external_reference == first.external_reference
    assert receipt.data["amount"] == "284.00"


def test_uncertain_attempt_commits_without_fabricating_receipt(database: Database) -> None:
    run_command = create_run(database)
    provider = DeterministicProviderSimulator()
    service = ToolService(database, build_provider_tool_registry(provider))
    run = get_run(database, run_command.public_id)
    assert run is not None

    with pytest.raises(ProviderTimeout):
        service.invoke(
            run_id=run.id,
            tool_name="create_refund_request",
            payload=payload(ProviderScenario.TIMEOUT_AFTER_ACCEPTANCE),
        )

    with database.session() as session:
        attempts = ToolAttemptRepository(session).list_for_run(run.id)
        receipt = ExternalReceiptRepository(session).get_by_idempotency_key(
            provider="deterministic_travel_provider",
            tool_name="create_refund_request",
            idempotency_key="refund-RF-1042-v1",
        )
    assert len(attempts) == 1
    assert attempts[0].outcome == "uncertain"
    assert attempts[0].side_effect_state is SideEffectState.POSSIBLE
    assert attempts[0].error_code == "provider_timeout_after_acceptance"
    assert receipt is None
    assert Decimal(attempts[0].request_data["amount"]) == Decimal("284.00")


@pytest.mark.parametrize(
    ("scenario", "error_type", "side_effect_state", "error_code"),
    [
        (
            ProviderScenario.REJECT_BEFORE_SIDE_EFFECT,
            ProviderRejected,
            SideEffectState.NONE,
            "provider_rejected",
        ),
        (
            ProviderScenario.TIMEOUT_BEFORE_SEND,
            ProviderPreSendTimeout,
            SideEffectState.NOT_ATTEMPTED,
            "provider_timeout_before_send",
        ),
    ],
)
def test_safe_failures_persist_exact_side_effect_knowledge(
    database: Database,
    scenario: ProviderScenario,
    error_type: type[Exception],
    side_effect_state: SideEffectState,
    error_code: str,
) -> None:
    run_command = create_run(database)
    service = ToolService(
        database,
        build_provider_tool_registry(DeterministicProviderSimulator()),
    )
    run = get_run(database, run_command.public_id)
    assert run is not None

    with pytest.raises(error_type):
        service.invoke(
            run_id=run.id,
            tool_name="create_refund_request",
            payload=payload(scenario),
        )

    with database.session() as session:
        attempt = ToolAttemptRepository(session).list_for_run(run.id)[0]
    assert attempt.outcome == "rejected"
    assert attempt.side_effect_state is side_effect_state
    assert attempt.error_code == error_code


def test_read_tool_persists_redacted_customer_output(database: Database) -> None:
    run_command = create_run(database)
    service = ToolService(
        database,
        build_provider_tool_registry(DeterministicProviderSimulator()),
    )
    run = get_run(database, run_command.public_id)
    assert run is not None

    service.invoke(
        run_id=run.id,
        tool_name="get_customer",
        payload={"customer_id": "CUS-2048"},
    )

    with database.session() as session:
        attempt = ToolAttemptRepository(session).list_for_run(run.id)[0]
    assert attempt.side_effect_state is SideEffectState.NONE
    assert attempt.response_data is not None
    assert attempt.response_data["name"] == "[REDACTED]"
    assert attempt.response_data["contact"] == "[REDACTED]"
