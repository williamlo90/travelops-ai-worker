from datetime import UTC, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utc_now() -> datetime:
    return datetime.now(UTC)


class Base(DeclarativeBase):
    pass


class TaskModel(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint("version > 0", name="ck_tasks_version_positive"),
        CheckConstraint("task_type = 'refund'", name="ck_tasks_supported_type"),
        CheckConstraint(
            "status IN ('queued', 'running', 'waiting_approval', 'completed_verified', "
            "'failed_no_side_effect', 'execution_uncertain', 'reconciling', 'escalated')",
            name="ck_tasks_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    public_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    task_type: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    summary: Mapped[str] = mapped_column(String(240), nullable=False, default="Refund request")
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    exposure_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    exposure_currency: Mapped[str | None] = mapped_column(String(3))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    request: Mapped["RequestModel"] = relationship(
        back_populates="task", cascade="all, delete-orphan", uselist=False
    )
    runs: Mapped[list["AgentRunModel"]] = relationship(back_populates="task")


class RequestModel(Base):
    __tablename__ = "requests"
    __table_args__ = (
        UniqueConstraint("task_id", name="uq_requests_task_id"),
        CheckConstraint("channel IN ('email', 'chat', 'phone')", name="ck_requests_channel"),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    task_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    channel: Mapped[str] = mapped_column(String(16), nullable=False)
    customer_message: Mapped[str] = mapped_column(Text, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    correlation_id: Mapped[str] = mapped_column(String(128), nullable=False)

    task: Mapped[TaskModel] = relationship(back_populates="request")


class AgentRunModel(Base):
    __tablename__ = "agent_runs"
    __table_args__ = (
        CheckConstraint("version > 0", name="ck_agent_runs_version_positive"),
        CheckConstraint(
            "status IN ('queued', 'running', 'waiting_approval', 'completed_verified', "
            "'failed_no_side_effect', 'execution_uncertain', 'reconciling', 'escalated')",
            name="ck_agent_runs_status",
        ),
        Index("ix_agent_runs_task_created", "task_id", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    public_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    task_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="RESTRICT"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    correlation_id: Mapped[str] = mapped_column(String(128), nullable=False)
    model_provider: Mapped[str | None] = mapped_column(String(64))
    model_version: Mapped[str | None] = mapped_column(String(64))
    prompt_version: Mapped[str | None] = mapped_column(String(64))
    graph_version: Mapped[str | None] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )

    task: Mapped[TaskModel] = relationship(back_populates="runs")
    tool_attempts: Mapped[list["ToolAttemptModel"]] = relationship(back_populates="run")


class AuditEventModel(Base):
    __tablename__ = "audit_events"
    __table_args__ = (
        Index("ix_audit_events_task_occurred", "task_id", "occurred_at"),
        Index("ix_audit_events_correlation", "correlation_id"),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    task_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="RESTRICT"), nullable=False
    )
    run_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="RESTRICT")
    )
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    actor_type: Mapped[str] = mapped_column(String(32), nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    correlation_id: Mapped[str] = mapped_column(String(128), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )


class CustomerSnapshotModel(Base):
    __tablename__ = "customer_snapshots"
    __table_args__ = (UniqueConstraint("task_id", name="uq_customer_snapshots_task_id"),)

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    task_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    customer_id: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    tier: Mapped[str] = mapped_column(String(16), nullable=False)
    locale: Mapped[str] = mapped_column(String(16), nullable=False)
    contact: Mapped[str] = mapped_column(String(254), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )


class BookingSnapshotModel(Base):
    __tablename__ = "booking_snapshots"
    __table_args__ = (UniqueConstraint("task_id", name="uq_booking_snapshots_task_id"),)

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    task_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    reference: Mapped[str] = mapped_column(String(64), nullable=False)
    service_date_label: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    provider: Mapped[str] = mapped_column(String(120), nullable=False)
    itinerary: Mapped[str] = mapped_column(String(240), nullable=False)
    passengers: Mapped[int] = mapped_column(Integer, nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )


class ToolAttemptModel(Base):
    __tablename__ = "tool_attempts"
    __table_args__ = (
        CheckConstraint(
            "outcome IN ('succeeded', 'rejected', 'uncertain')",
            name="ck_tool_attempts_outcome",
        ),
        CheckConstraint(
            "side_effect_state IN ('not_attempted', 'none', 'confirmed', 'possible')",
            name="ck_tool_attempts_side_effect_state",
        ),
        Index("ix_tool_attempts_run_started", "run_id", "started_at"),
        Index("ix_tool_attempts_idempotency", "tool_name", "idempotency_key"),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    run_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="RESTRICT"), nullable=False
    )
    tool_name: Mapped[str] = mapped_column(String(64), nullable=False)
    outcome: Mapped[str] = mapped_column(String(16), nullable=False)
    side_effect_state: Mapped[str] = mapped_column(String(16), nullable=False)
    idempotency_key: Mapped[str | None] = mapped_column(String(128))
    request_data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    response_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    error_code: Mapped[str | None] = mapped_column(String(64))
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
    finished_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )

    run: Mapped[AgentRunModel] = relationship(back_populates="tool_attempts")
    receipt: Mapped["ExternalReceiptModel | None"] = relationship(
        back_populates="tool_attempt", uselist=False
    )


class ExternalReceiptModel(Base):
    __tablename__ = "external_receipts"
    __table_args__ = (
        UniqueConstraint("tool_attempt_id", name="uq_external_receipts_tool_attempt_id"),
        UniqueConstraint(
            "provider",
            "tool_name",
            "idempotency_key",
            name="uq_external_receipts_provider_tool_idempotency",
        ),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    tool_attempt_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("tool_attempts.id", ondelete="RESTRICT"),
        nullable=False,
    )
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    tool_name: Mapped[str] = mapped_column(String(64), nullable=False)
    external_reference: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    data: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )

    tool_attempt: Mapped[ToolAttemptModel] = relationship(back_populates="receipt")


class RiskDecisionModel(Base):
    __tablename__ = "risk_decisions"
    __table_args__ = (UniqueConstraint("run_id", name="uq_risk_decisions_run_id"),)

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    run_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="RESTRICT"), nullable=False
    )
    requires_approval: Mapped[bool] = mapped_column(nullable=False)
    risk_codes: Mapped[list[str]] = mapped_column(JSONB, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    rule_version: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )


class ProposalVersionModel(Base):
    __tablename__ = "proposal_versions"
    __table_args__ = (
        UniqueConstraint("task_id", "version", name="uq_proposal_versions_task_version"),
        UniqueConstraint("run_id", name="uq_proposal_versions_run_id"),
        CheckConstraint("version > 0", name="ck_proposal_versions_version_positive"),
        CheckConstraint(
            "status = 'draft_waiting_evidence'",
            name="ck_proposal_versions_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    task_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="RESTRICT"), nullable=False
    )
    run_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("agent_runs.id", ondelete="RESTRICT"), nullable=False
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    tool_name: Mapped[str] = mapped_column(String(64), nullable=False)
    parameters: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    expected_postcondition: Mapped[str] = mapped_column(Text, nullable=False)
    model_provider: Mapped[str] = mapped_column(String(64), nullable=False)
    model_version: Mapped[str] = mapped_column(String(64), nullable=False)
    prompt_version: Mapped[str] = mapped_column(String(64), nullable=False)
    graph_version: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )
