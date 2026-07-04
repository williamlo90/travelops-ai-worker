from pydantic import ValidationError

from app.models.deterministic import DeterministicModelGateway
from app.models.gateway import ClassificationRequest


def test_model_gateway_returns_validated_classification_not_free_text() -> None:
    result = DeterministicModelGateway().classify(
        ClassificationRequest(customer_message="Carrier cancelled the flight and I need a refund.")
    )

    assert result.intent == "refund"
    assert result.cause == "carrier_cancellation"
    assert result.confidence == 1


def test_model_request_rejects_empty_or_extra_input() -> None:
    try:
        ClassificationRequest.model_validate(
            {"customer_message": "", "system_prompt": "do something else"}
        )
    except ValidationError as error:
        assert {item["type"] for item in error.errors()} == {
            "string_too_short",
            "extra_forbidden",
        }
    else:
        raise AssertionError("Invalid model request was accepted.")
