from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.integrations.provider_simulator import DeterministicProviderSimulator
from app.tools.contracts import (
    CreateRefundInput,
    LookupRefundInput,
    RefundLookupOutput,
)
from app.tools.provider_tools import build_provider_tool_registry
from app.tools.redaction import redact
from app.tools.registry import UnknownTool


def test_tool_contracts_reject_extra_and_invalid_fields() -> None:
    with pytest.raises(ValidationError):
        CreateRefundInput.model_validate(
            {
                "booking_reference": "BA218",
                "amount": "-1",
                "currency": "usd",
                "idempotency_key": "refund-key",
                "unexpected": True,
            }
        )

    with pytest.raises(ValidationError):
        LookupRefundInput(booking_reference="BA218")

    with pytest.raises(ValidationError):
        RefundLookupOutput(found=True)


def test_registry_exposes_only_explicit_business_tools() -> None:
    registry = build_provider_tool_registry(DeterministicProviderSimulator())

    assert registry.names == (
        "create_refund_request",
        "get_booking",
        "get_customer",
        "get_refund",
    )
    booking = registry.invoke("get_booking", {"booking_reference": "BA218"})
    assert booking.model_dump()["paid_amount"] == Decimal("284.00")

    with pytest.raises(UnknownTool):
        registry.invoke("arbitrary_http_request", {"url": "https://example.test"})


def test_redaction_is_recursive_and_does_not_mutate_business_fields() -> None:
    value = {
        "customer": {"name": "Maya Chen", "contact": "maya@example.test"},
        "booking_reference": "BA218",
        "token": "secret",
    }

    assert redact(value) == {
        "customer": {"name": "[REDACTED]", "contact": "[REDACTED]"},
        "booking_reference": "BA218",
        "token": "[REDACTED]",
    }
