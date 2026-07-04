from typing import cast

from app.integrations.provider_simulator import DeterministicProviderSimulator
from app.tools.contracts import (
    BookingOutput,
    CreateRefundInput,
    CustomerOutput,
    GetBookingInput,
    GetCustomerInput,
    LookupRefundInput,
    RefundLookupOutput,
    RefundReceiptOutput,
)
from app.tools.registry import RegisteredTool, ToolRegistry


def build_provider_tool_registry(
    provider: DeterministicProviderSimulator,
) -> ToolRegistry:
    registry = ToolRegistry()
    registry.register(
        RegisteredTool(
            name="get_booking",
            input_model=GetBookingInput,
            output_model=BookingOutput,
            handler=lambda value: provider.get_booking(cast(GetBookingInput, value)),
        )
    )
    registry.register(
        RegisteredTool(
            name="get_customer",
            input_model=GetCustomerInput,
            output_model=CustomerOutput,
            handler=lambda value: provider.get_customer(cast(GetCustomerInput, value)),
        )
    )
    registry.register(
        RegisteredTool(
            name="create_refund_request",
            input_model=CreateRefundInput,
            output_model=RefundReceiptOutput,
            handler=lambda value: provider.create_refund(cast(CreateRefundInput, value)),
            has_side_effect=True,
        )
    )
    registry.register(
        RegisteredTool(
            name="get_refund",
            input_model=LookupRefundInput,
            output_model=RefundLookupOutput,
            handler=lambda value: provider.lookup_refund(cast(LookupRefundInput, value)),
        )
    )
    return registry
