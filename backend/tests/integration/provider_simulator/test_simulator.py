from decimal import Decimal

import pytest

from app.integrations.provider_simulator import DeterministicProviderSimulator
from app.tools.contracts import (
    CreateRefundInput,
    LookupRefundInput,
    ProviderScenario,
    SideEffectState,
)
from app.tools.errors import ProviderPreSendTimeout, ProviderRejected, ProviderTimeout


def refund_input(
    scenario: ProviderScenario,
    *,
    idempotency_key: str = "refund-RF-1042-v1",
) -> CreateRefundInput:
    return CreateRefundInput(
        booking_reference="BA218",
        amount=Decimal("284.00"),
        currency="USD",
        idempotency_key=idempotency_key,
        scenario=scenario,
    )


def test_success_and_duplicate_key_return_same_logical_receipt() -> None:
    provider = DeterministicProviderSimulator()

    first = provider.create_refund(refund_input(ProviderScenario.SUCCESS))
    duplicate = provider.create_refund(refund_input(ProviderScenario.REJECT_BEFORE_SIDE_EFFECT))

    assert duplicate.external_reference == first.external_reference
    assert duplicate.idempotency_key == first.idempotency_key
    assert duplicate.duplicate is True


def test_rejection_happens_before_side_effect() -> None:
    provider = DeterministicProviderSimulator()

    with pytest.raises(ProviderRejected) as captured:
        provider.create_refund(refund_input(ProviderScenario.REJECT_BEFORE_SIDE_EFFECT))

    assert captured.value.side_effect_state is SideEffectState.NONE
    lookup = provider.lookup_refund(
        LookupRefundInput(
            booking_reference="BA218",
            idempotency_key="refund-RF-1042-v1",
        )
    )
    assert lookup.found is False


def test_timeout_after_acceptance_requires_lookup_not_blind_retry() -> None:
    provider = DeterministicProviderSimulator()

    with pytest.raises(ProviderTimeout) as captured:
        provider.create_refund(refund_input(ProviderScenario.TIMEOUT_AFTER_ACCEPTANCE))

    assert captured.value.side_effect_state is SideEffectState.POSSIBLE
    lookup = provider.lookup_refund(
        LookupRefundInput(
            booking_reference="BA218",
            idempotency_key="refund-RF-1042-v1",
        )
    )
    assert lookup.found is True
    assert lookup.receipt is not None


def test_timeout_before_send_has_no_possible_side_effect() -> None:
    provider = DeterministicProviderSimulator()

    with pytest.raises(ProviderPreSendTimeout) as captured:
        provider.create_refund(refund_input(ProviderScenario.TIMEOUT_BEFORE_SEND))

    assert captured.value.side_effect_state is SideEffectState.NOT_ATTEMPTED
    lookup = provider.lookup_refund(
        LookupRefundInput(
            booking_reference="BA218",
            idempotency_key="refund-RF-1042-v1",
        )
    )
    assert lookup.found is False


def test_delayed_postcondition_becomes_visible_deterministically() -> None:
    provider = DeterministicProviderSimulator()
    receipt = provider.create_refund(
        refund_input(
            ProviderScenario.DELAYED_POSTCONDITION,
            idempotency_key="refund-RF-1042-delayed",
        )
    )
    lookup = LookupRefundInput(
        booking_reference="BA218",
        external_reference=receipt.external_reference,
    )

    assert provider.lookup_refund(lookup).found is False
    assert provider.lookup_refund(lookup).found is False
    assert provider.lookup_refund(lookup).found is True
