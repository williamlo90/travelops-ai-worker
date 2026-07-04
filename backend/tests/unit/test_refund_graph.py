from typing import cast

import pytest
from langgraph.checkpoint.memory import InMemorySaver

from app.domain.proposals import IntentClassification
from app.models.deterministic import DeterministicModelGateway
from app.models.gateway import (
    ClassificationRequest,
    ModelGatewayTimeout,
    ModelGatewayUnavailable,
)
from app.orchestration.refund_graph import build_refund_graph
from app.orchestration.state import RefundGraphState


def graph_input() -> RefundGraphState:
    return RefundGraphState(
        task_id="task-id",
        run_id="run-id",
        customer_message="The airline cancelled my flight. Please refund it.",
        booking_reference="BA218",
        booking_status="cancelled",
        customer_tier="standard",
        amount="284.00",
        currency="USD",
    )


def test_graph_produces_typed_bounded_draft_with_deterministic_risk() -> None:
    graph = build_refund_graph(DeterministicModelGateway(), InMemorySaver())

    result = cast(
        RefundGraphState,
        graph.invoke(
            graph_input(),
            config={"configurable": {"thread_id": "unit-success"}},
        ),
    )

    assert result["classification"] == {
        "intent": "refund",
        "cause": "carrier_cancellation",
        "confidence": 1.0,
    }
    assert result["policy_status"] == "pending_retrieval"
    assert result["eligible"] is True
    assert result["risk_codes"] == ["amount_above_operator_threshold"]
    assert result["requires_approval"] is True
    assert result["proposal"]["status"] == "draft_waiting_evidence"
    assert result["proposal"]["tool_name"] == "create_refund_request"


def test_deterministic_rules_not_model_control_risk() -> None:
    state = graph_input()
    state["amount"] = "50.00"
    state["customer_tier"] = "vip"
    graph = build_refund_graph(DeterministicModelGateway(), InMemorySaver())

    result = cast(
        RefundGraphState,
        graph.invoke(
            state,
            config={"configurable": {"thread_id": "unit-vip"}},
        ),
    )

    assert result["risk_codes"] == ["vip_customer"]
    assert result["requires_approval"] is True


class TimeoutGateway:
    provider_name = "timeout-test"
    model_version = "v1"

    def classify(self, request: ClassificationRequest) -> IntentClassification:
        raise ModelGatewayTimeout("classification timed out")


def test_model_timeout_stops_graph_before_proposal() -> None:
    graph = build_refund_graph(TimeoutGateway(), InMemorySaver())

    with pytest.raises(ModelGatewayTimeout):
        graph.invoke(
            graph_input(),
            config={"configurable": {"thread_id": "unit-timeout"}},
        )


class UnavailableGateway:
    provider_name = "unavailable-test"
    model_version = "v1"

    def classify(self, request: ClassificationRequest) -> IntentClassification:
        raise ModelGatewayUnavailable("provider unavailable")


def test_model_unavailable_stops_graph_before_proposal() -> None:
    graph = build_refund_graph(UnavailableGateway(), InMemorySaver())

    with pytest.raises(ModelGatewayUnavailable):
        graph.invoke(
            graph_input(),
            config={"configurable": {"thread_id": "unit-unavailable"}},
        )


class InvalidSchemaGateway:
    provider_name = "invalid-schema-test"
    model_version = "v1"

    def classify(self, request: ClassificationRequest) -> IntentClassification:
        return cast(IntentClassification, {"free_text": "probably refund"})


def test_invalid_model_schema_cannot_reach_proposal() -> None:
    graph = build_refund_graph(InvalidSchemaGateway(), InMemorySaver())

    with pytest.raises(AttributeError):
        graph.invoke(
            graph_input(),
            config={"configurable": {"thread_id": "unit-invalid-schema"}},
        )
