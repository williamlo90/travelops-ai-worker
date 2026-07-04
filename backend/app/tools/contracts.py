from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class StrictToolModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class ProviderScenario(StrEnum):
    SUCCESS = "success"
    REJECT_BEFORE_SIDE_EFFECT = "reject_before_side_effect"
    TIMEOUT_BEFORE_SEND = "timeout_before_send"
    TIMEOUT_AFTER_ACCEPTANCE = "timeout_after_acceptance"
    DELAYED_POSTCONDITION = "delayed_postcondition"


class SideEffectState(StrEnum):
    NOT_ATTEMPTED = "not_attempted"
    NONE = "none"
    CONFIRMED = "confirmed"
    POSSIBLE = "possible"


class RefundStatus(StrEnum):
    PENDING = "pending"
    COMPLETED = "completed"


class GetBookingInput(StrictToolModel):
    booking_reference: str = Field(min_length=3, max_length=64)


class BookingOutput(StrictToolModel):
    booking_reference: str
    customer_id: str
    status: str
    provider: str
    paid_amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    currency: str = Field(pattern=r"^[A-Z]{3}$")


class GetCustomerInput(StrictToolModel):
    customer_id: str = Field(min_length=3, max_length=32)


class CustomerOutput(StrictToolModel):
    customer_id: str
    name: str
    tier: str
    locale: str
    contact: str


class CreateRefundInput(StrictToolModel):
    booking_reference: str = Field(min_length=3, max_length=64)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    idempotency_key: str = Field(min_length=8, max_length=128)
    scenario: ProviderScenario = ProviderScenario.SUCCESS


class RefundReceiptOutput(StrictToolModel):
    external_reference: str
    booking_reference: str
    idempotency_key: str
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    status: RefundStatus
    duplicate: bool = False


class LookupRefundInput(StrictToolModel):
    booking_reference: str = Field(min_length=3, max_length=64)
    idempotency_key: str | None = Field(default=None, min_length=8, max_length=128)
    external_reference: str | None = Field(default=None, min_length=3, max_length=64)

    @model_validator(mode="after")
    def require_lookup_key(self) -> "LookupRefundInput":
        if self.idempotency_key is None and self.external_reference is None:
            raise ValueError("Either idempotency_key or external_reference is required.")
        return self


class RefundLookupOutput(StrictToolModel):
    found: bool
    receipt: RefundReceiptOutput | None = None

    @model_validator(mode="after")
    def receipt_matches_found(self) -> "RefundLookupOutput":
        if self.found != (self.receipt is not None):
            raise ValueError("found must match receipt presence.")
        return self
