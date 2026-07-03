import base64
from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import Select, or_, select

from app.api.schemas.tasks import (
    MoneyResponse,
    TaskBookingSummaryResponse,
    TaskCustomerSummaryResponse,
    TaskDetailResponse,
    TaskListResponse,
    TaskSummaryResponse,
    TaskWorkspaceResponse,
)
from app.domain.context import BookingSnapshotRecord, CustomerSnapshotRecord
from app.persistence.database import Database
from app.persistence.models import (
    BookingSnapshotModel,
    CustomerSnapshotModel,
    RequestModel,
    TaskModel,
)


def _encode_cursor(offset: int) -> str:
    return base64.urlsafe_b64encode(str(offset).encode()).decode()


def _decode_cursor(cursor: str | None) -> int:
    if not cursor:
        return 0
    try:
        value = int(base64.urlsafe_b64decode(cursor.encode()).decode())
    except (ValueError, UnicodeDecodeError) as exc:
        raise ValueError("Invalid task cursor.") from exc
    if value < 0:
        raise ValueError("Invalid task cursor.")
    return value


def _presentation_status(task: TaskModel) -> str:
    if task.exposure_amount is not None and task.exposure_amount > Decimal("100"):
        return "needs_approval"
    if task.status == "escalated":
        return "needs_information"
    return "gathering_policy"


def _utc_timestamp(value: datetime) -> str:
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")


def _summary(
    task: TaskModel,
    customer: CustomerSnapshotRecord,
    booking: BookingSnapshotRecord,
) -> TaskSummaryResponse:
    due_minutes = max(0, int((task.due_at - datetime.now(UTC)).total_seconds() // 60))
    exposure = (
        MoneyResponse(amount=float(task.exposure_amount), currency=task.exposure_currency or "USD")
        if task.exposure_amount is not None
        else None
    )
    return TaskSummaryResponse(
        id=task.public_id,
        type=task.task_type,
        summary=task.summary,
        customer=TaskCustomerSummaryResponse(name=customer.name, is_vip=customer.tier == "vip"),
        booking=TaskBookingSummaryResponse(
            reference=booking.reference,
            service_date_label=booking.service_date_label,
        ),
        status=_presentation_status(task),
        due_in_minutes=due_minutes,
        exposure=exposure,
    )


class TaskReadService:
    def __init__(self, database: Database) -> None:
        self.database = database

    def list_tasks(
        self,
        *,
        status: str | None,
        task_type: str | None,
        query: str | None,
        sort: str,
        cursor: str | None,
        limit: int,
    ) -> TaskListResponse:
        offset = _decode_cursor(cursor)
        with self.database.session() as session:
            statement = self._base_query()
            if task_type:
                statement = statement.where(TaskModel.task_type == task_type)
            if query:
                pattern = f"%{query.strip()}%"
                statement = statement.where(
                    or_(
                        TaskModel.public_id.ilike(pattern),
                        TaskModel.summary.ilike(pattern),
                        CustomerSnapshotModel.name.ilike(pattern),
                        BookingSnapshotModel.reference.ilike(pattern),
                    )
                )
            statement = self._sort(statement, sort)
            rows = list(session.execute(statement).all())
            summaries = [
                _summary(
                    task,
                    CustomerSnapshotRecord.model_validate(customer),
                    BookingSnapshotRecord.model_validate(booking),
                )
                for task, customer, booking in rows
            ]
            if status:
                summaries = [item for item in summaries if item.status == status]
            total = len(summaries)
            page = summaries[offset : offset + limit]
            next_cursor = _encode_cursor(offset + limit) if offset + limit < total else None
            return TaskListResponse(items=page, next_cursor=next_cursor, total=total)

    def get_task(self, public_id: str) -> TaskDetailResponse | None:
        with self.database.session() as session:
            row = session.execute(
                self._base_query().where(TaskModel.public_id == public_id)
            ).one_or_none()
            if row is None:
                return None
            task, customer_model, booking_model = row
            customer = CustomerSnapshotRecord.model_validate(customer_model)
            booking = BookingSnapshotRecord.model_validate(booking_model)
            request = session.scalar(select(RequestModel).where(RequestModel.task_id == task.id))
            if request is None:
                return None
            summary = _summary(task, customer, booking)
            return TaskDetailResponse(
                data=self._workspace(task, request, customer, booking, summary)
            )

    @staticmethod
    def _base_query() -> Select[tuple[TaskModel, CustomerSnapshotModel, BookingSnapshotModel]]:
        return (
            select(TaskModel, CustomerSnapshotModel, BookingSnapshotModel)
            .join(CustomerSnapshotModel, CustomerSnapshotModel.task_id == TaskModel.id)
            .join(BookingSnapshotModel, BookingSnapshotModel.task_id == TaskModel.id)
        )

    @staticmethod
    def _sort(
        statement: Select[tuple[TaskModel, CustomerSnapshotModel, BookingSnapshotModel]], sort: str
    ) -> Select[tuple[TaskModel, CustomerSnapshotModel, BookingSnapshotModel]]:
        if sort == "exposure_desc":
            return statement.order_by(
                TaskModel.exposure_amount.desc().nulls_last(), TaskModel.public_id
            )
        if sort == "sla_asc":
            return statement.order_by(TaskModel.due_at, TaskModel.public_id)
        return statement.order_by(CustomerSnapshotModel.tier.desc(), TaskModel.due_at)

    @staticmethod
    def _workspace(
        task: TaskModel,
        request: RequestModel,
        customer: CustomerSnapshotRecord,
        booking: BookingSnapshotRecord,
        summary: TaskSummaryResponse,
    ) -> TaskWorkspaceResponse:
        amount = float(booking.paid_amount)
        return TaskWorkspaceResponse(
            task=summary,
            request={
                "received_at": _utc_timestamp(request.received_at),
                "channel": request.channel,
                "customer_message": request.customer_message,
            },
            customer={
                "id": customer.customer_id,
                "tier": customer.tier,
                "locale": customer.locale,
                "contact": customer.contact,
            },
            booking={
                "status": booking.status,
                "provider": booking.provider,
                "itinerary": booking.itinerary,
                "passengers": booking.passengers,
                "paid_amount": {"amount": amount, "currency": booking.currency},
            },
            evidence=[
                {
                    "id": "POL-REF-4.2",
                    "title": "Refund Policy",
                    "clause": "§4.2 Carrier cancellation",
                    "excerpt": "A carrier-cancelled flight is eligible for a full refund.",
                    "effective_date": "01 Jan 2026",
                }
            ],
            risks=[
                {
                    "id": "RISK-AMOUNT",
                    "label": "Refund approval threshold",
                    "outcome": "requires_approval",
                    "explanation": "The refund exceeds the USD 100 operator threshold.",
                }
            ],
            recommendation={
                "outcome": "Issue a full refund",
                "amount": {"amount": amount, "currency": booking.currency},
                "confidence": "high",
                "decision_summary": "Demo projection from persisted booking and customer context.",
                "uncertainty": None,
            },
            proposed_action={
                "version": 1,
                "tool": "create_refund_request",
                "parameters": {
                    "booking_id": booking.reference,
                    "amount": amount,
                    "currency": booking.currency,
                    "reason_code": "CARRIER_CANCELLED",
                    "original_payment_method": True,
                },
                "expected_postcondition": "A pending refund exists with an external reference.",
                "approval_required": True,
            },
            activity=[
                {
                    "id": "ACT-PERSISTED",
                    "label": "Request context loaded",
                    "detail": "Persisted booking and customer snapshots are available.",
                    "timestamp": _utc_timestamp(request.received_at),
                    "status": "completed",
                },
                {
                    "id": "ACT-WAITING",
                    "label": "Waiting for approval",
                    "detail": "Refund amount exceeds the operator threshold.",
                    "timestamp": _utc_timestamp(task.updated_at),
                    "status": "waiting",
                },
            ],
        )
