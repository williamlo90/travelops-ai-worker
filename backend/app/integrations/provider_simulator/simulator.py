from dataclasses import dataclass
from decimal import Decimal
from hashlib import sha256

from app.tools.contracts import (
    BookingOutput,
    CreateRefundInput,
    CustomerOutput,
    GetBookingInput,
    GetCustomerInput,
    LookupRefundInput,
    ProviderScenario,
    RefundLookupOutput,
    RefundReceiptOutput,
    RefundStatus,
)
from app.tools.errors import (
    ProviderPreSendTimeout,
    ProviderRecordNotFound,
    ProviderRejected,
    ProviderTimeout,
)


@dataclass
class _StoredRefund:
    receipt: RefundReceiptOutput
    visible_after_lookups: int
    lookup_count: int = 0


class DeterministicProviderSimulator:
    """Stateful test provider with selected, repeatable failure boundaries."""

    def __init__(self) -> None:
        self._bookings = {
            "BA218": BookingOutput(
                booking_reference="BA218",
                customer_id="CUS-2048",
                status="cancelled",
                provider="British Airways",
                paid_amount=Decimal("284.00"),
                currency="USD",
            )
        }
        self._customers = {
            "CUS-2048": CustomerOutput(
                customer_id="CUS-2048",
                name="Maya Chen",
                tier="standard",
                locale="en-SG",
                contact="maya.chen@example.test",
            )
        }
        self._refunds: dict[str, _StoredRefund] = {}

    def get_booking(self, request: GetBookingInput) -> BookingOutput:
        booking = self._bookings.get(request.booking_reference)
        if booking is None:
            raise ProviderRecordNotFound("Booking")
        return booking.model_copy(deep=True)

    def get_customer(self, request: GetCustomerInput) -> CustomerOutput:
        customer = self._customers.get(request.customer_id)
        if customer is None:
            raise ProviderRecordNotFound("Customer")
        return customer.model_copy(deep=True)

    def create_refund(self, request: CreateRefundInput) -> RefundReceiptOutput:
        existing = self._refunds.get(request.idempotency_key)
        if existing is not None:
            return existing.receipt.model_copy(update={"duplicate": True})

        if request.scenario is ProviderScenario.REJECT_BEFORE_SIDE_EFFECT:
            raise ProviderRejected()
        if request.scenario is ProviderScenario.TIMEOUT_BEFORE_SEND:
            raise ProviderPreSendTimeout()

        booking = self.get_booking(GetBookingInput(booking_reference=request.booking_reference))
        if request.currency != booking.currency or request.amount > booking.paid_amount:
            raise ProviderRejected("Refund amount or currency does not match the booking.")

        reference_suffix = sha256(request.idempotency_key.encode()).hexdigest()[:10].upper()
        receipt = RefundReceiptOutput(
            external_reference=f"RFD-{reference_suffix}",
            booking_reference=request.booking_reference,
            idempotency_key=request.idempotency_key,
            amount=request.amount,
            currency=request.currency,
            status=RefundStatus.PENDING,
        )
        self._refunds[request.idempotency_key] = _StoredRefund(
            receipt=receipt,
            visible_after_lookups=(
                2 if request.scenario is ProviderScenario.DELAYED_POSTCONDITION else 0
            ),
        )

        if request.scenario is ProviderScenario.TIMEOUT_AFTER_ACCEPTANCE:
            raise ProviderTimeout()
        return receipt.model_copy(deep=True)

    def lookup_refund(self, request: LookupRefundInput) -> RefundLookupOutput:
        stored = self._find_refund(request)
        if stored is None:
            return RefundLookupOutput(found=False)

        stored.lookup_count += 1
        if stored.lookup_count <= stored.visible_after_lookups:
            return RefundLookupOutput(found=False)
        return RefundLookupOutput(found=True, receipt=stored.receipt.model_copy(deep=True))

    def _find_refund(self, request: LookupRefundInput) -> _StoredRefund | None:
        if request.idempotency_key is not None:
            stored = self._refunds.get(request.idempotency_key)
            if stored and stored.receipt.booking_reference == request.booking_reference:
                return stored
            return None
        return next(
            (
                stored
                for stored in self._refunds.values()
                if stored.receipt.external_reference == request.external_reference
                and stored.receipt.booking_reference == request.booking_reference
            ),
            None,
        )
