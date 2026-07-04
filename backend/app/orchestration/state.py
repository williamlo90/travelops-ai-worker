from typing import Any, TypedDict


class RefundGraphState(TypedDict, total=False):
    task_id: str
    run_id: str
    customer_message: str
    booking_reference: str
    booking_status: str
    customer_tier: str
    amount: str
    currency: str
    classification: dict[str, Any]
    policy_status: str
    eligible: bool
    risk_codes: list[str]
    requires_approval: bool
    risk_explanation: str
    proposal: dict[str, Any]
