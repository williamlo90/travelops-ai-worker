from typing import Any, Literal

from pydantic import BaseModel


class MoneyResponse(BaseModel):
    amount: float
    currency: str


class TaskCustomerSummaryResponse(BaseModel):
    name: str
    is_vip: bool


class TaskBookingSummaryResponse(BaseModel):
    reference: str
    service_date_label: str


class TaskSummaryResponse(BaseModel):
    id: str
    type: Literal["refund", "ticket_change", "booking_issue"]
    summary: str
    customer: TaskCustomerSummaryResponse
    booking: TaskBookingSummaryResponse
    status: Literal["needs_approval", "gathering_policy", "needs_information"]
    due_in_minutes: int
    exposure: MoneyResponse | None


class ResponseMeta(BaseModel):
    data_mode: Literal["demo"] = "demo"


class TaskListResponse(BaseModel):
    items: list[TaskSummaryResponse]
    next_cursor: str | None
    total: int
    meta: ResponseMeta = ResponseMeta()


class TaskWorkspaceResponse(BaseModel):
    task: TaskSummaryResponse
    request: dict[str, Any]
    customer: dict[str, Any]
    booking: dict[str, Any]
    evidence: list[dict[str, Any]]
    risks: list[dict[str, Any]]
    recommendation: dict[str, Any]
    proposed_action: dict[str, Any]
    activity: list[dict[str, Any]]


class TaskDetailResponse(BaseModel):
    data: TaskWorkspaceResponse
    meta: ResponseMeta = ResponseMeta()
