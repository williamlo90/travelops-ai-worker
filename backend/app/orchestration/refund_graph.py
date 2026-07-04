from decimal import Decimal
from typing import Any

from langgraph.graph import END, START, StateGraph

from app.models.gateway import ClassificationRequest, ModelGateway
from app.orchestration.state import RefundGraphState

GRAPH_VERSION = "refund-graph-v1"
PROMPT_VERSION = "classify-refund-v1"
RISK_RULE_VERSION = "refund-risk-v1"


def build_refund_graph(model_gateway: ModelGateway, checkpointer: Any) -> Any:
    def classify(state: RefundGraphState) -> dict[str, Any]:
        result = model_gateway.classify(
            ClassificationRequest(customer_message=state["customer_message"])
        )
        return {"classification": result.model_dump(mode="json")}

    def preliminary_policy(_: RefundGraphState) -> dict[str, Any]:
        return {"policy_status": "pending_retrieval"}

    def eligibility(state: RefundGraphState) -> dict[str, bool]:
        classification = state["classification"]
        return {
            "eligible": (
                state["booking_status"] == "cancelled"
                and classification["cause"] == "carrier_cancellation"
            )
        }

    def risk(state: RefundGraphState) -> dict[str, Any]:
        codes: list[str] = []
        if Decimal(state["amount"]) > Decimal("100"):
            codes.append("amount_above_operator_threshold")
        if state["customer_tier"] == "vip":
            codes.append("vip_customer")
        if not state["eligible"]:
            codes.append("eligibility_not_established")
        return {
            "risk_codes": codes,
            "requires_approval": bool(codes),
            "risk_explanation": (
                "Deterministic risk rules require review."
                if codes
                else "No deterministic approval trigger was found."
            ),
        }

    def propose(state: RefundGraphState) -> dict[str, dict[str, Any]]:
        return {
            "proposal": {
                "status": "draft_waiting_evidence",
                "tool_name": "create_refund_request",
                "parameters": {
                    "booking_reference": state["booking_reference"],
                    "amount": state["amount"],
                    "currency": state["currency"],
                    "reason_code": "CARRIER_CANCELLED",
                },
                "expected_postcondition": (
                    "A provider refund exists with the approved amount and external reference."
                ),
            }
        }

    builder: StateGraph[
        RefundGraphState,
        None,
        RefundGraphState,
        RefundGraphState,
    ] = StateGraph(RefundGraphState)
    builder.add_node("classify", classify)
    builder.add_node("preliminary_policy", preliminary_policy)  # type: ignore[arg-type]
    builder.add_node("eligibility", eligibility)
    builder.add_node("risk", risk)
    builder.add_node("propose", propose)
    builder.add_edge(START, "classify")
    builder.add_edge("classify", "preliminary_policy")
    builder.add_edge("preliminary_policy", "eligibility")
    builder.add_edge("eligibility", "risk")
    builder.add_edge("risk", "propose")
    builder.add_edge("propose", END)
    return builder.compile(checkpointer=checkpointer)
