from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.domain.proposals import (
    ProposalStatus,
    ProposalVersionRecord,
    RiskDecisionRecord,
)
from app.persistence.models import (
    AgentRunModel,
    BookingSnapshotModel,
    CustomerSnapshotModel,
    ProposalVersionModel,
    RequestModel,
    RiskDecisionModel,
    TaskModel,
)


class OrchestrationContext:
    def __init__(
        self,
        *,
        task_id: UUID,
        customer_message: str,
        booking_reference: str,
        booking_status: str,
        customer_tier: str,
        amount: Decimal,
        currency: str,
    ) -> None:
        self.task_id = task_id
        self.customer_message = customer_message
        self.booking_reference = booking_reference
        self.booking_status = booking_status
        self.customer_tier = customer_tier
        self.amount = amount
        self.currency = currency


class OrchestrationRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def load_context(self, task_public_id: str) -> OrchestrationContext | None:
        row = self.session.execute(
            select(TaskModel, RequestModel, BookingSnapshotModel, CustomerSnapshotModel)
            .join(RequestModel, RequestModel.task_id == TaskModel.id)
            .join(BookingSnapshotModel, BookingSnapshotModel.task_id == TaskModel.id)
            .join(CustomerSnapshotModel, CustomerSnapshotModel.task_id == TaskModel.id)
            .where(TaskModel.public_id == task_public_id)
        ).one_or_none()
        if row is None:
            return None
        task, request, booking, customer = row
        return OrchestrationContext(
            task_id=task.id,
            customer_message=request.customer_message,
            booking_reference=booking.reference,
            booking_status=booking.status,
            customer_tier=customer.tier,
            amount=booking.paid_amount,
            currency=booking.currency,
        )

    def set_run_provenance(
        self,
        *,
        run_id: UUID,
        model_provider: str,
        model_version: str,
        prompt_version: str,
        graph_version: str,
    ) -> None:
        run = self.session.get(AgentRunModel, run_id)
        if run is None:
            raise LookupError(f"Agent run {run_id} does not exist.")
        run.model_provider = model_provider
        run.model_version = model_version
        run.prompt_version = prompt_version
        run.graph_version = graph_version
        self.session.flush()

    def persist_result(
        self,
        *,
        task_id: UUID,
        run_id: UUID,
        risk_codes: list[str],
        requires_approval: bool,
        risk_explanation: str,
        rule_version: str,
        proposal: dict[str, Any],
        amount: Decimal,
        currency: str,
        model_provider: str,
        model_version: str,
        prompt_version: str,
        graph_version: str,
    ) -> ProposalVersionRecord:
        existing = self.session.scalar(
            select(ProposalVersionModel).where(ProposalVersionModel.run_id == run_id)
        )
        if existing is not None:
            return ProposalVersionRecord.model_validate(existing)

        latest_version = self.session.scalar(
            select(func.max(ProposalVersionModel.version)).where(
                ProposalVersionModel.task_id == task_id
            )
        )
        risk = RiskDecisionModel(
            run_id=run_id,
            requires_approval=requires_approval,
            risk_codes=risk_codes,
            explanation=risk_explanation,
            rule_version=rule_version,
        )
        model = ProposalVersionModel(
            task_id=task_id,
            run_id=run_id,
            version=(latest_version or 0) + 1,
            status=ProposalStatus.DRAFT_WAITING_EVIDENCE.value,
            tool_name=str(proposal["tool_name"]),
            parameters=dict(proposal["parameters"]),
            amount=amount,
            currency=currency,
            expected_postcondition=str(proposal["expected_postcondition"]),
            model_provider=model_provider,
            model_version=model_version,
            prompt_version=prompt_version,
            graph_version=graph_version,
        )
        self.session.add_all([risk, model])
        self.session.flush()
        return ProposalVersionRecord.model_validate(model)

    def get_proposal(self, *, task_public_id: str, version: int) -> ProposalVersionRecord | None:
        model = self.session.scalar(
            select(ProposalVersionModel)
            .join(TaskModel, TaskModel.id == ProposalVersionModel.task_id)
            .where(TaskModel.public_id == task_public_id, ProposalVersionModel.version == version)
        )
        return ProposalVersionRecord.model_validate(model) if model else None

    def get_proposal_for_run(self, run_id: UUID) -> ProposalVersionRecord | None:
        model = self.session.scalar(
            select(ProposalVersionModel).where(ProposalVersionModel.run_id == run_id)
        )
        return ProposalVersionRecord.model_validate(model) if model else None

    def get_risk(self, run_id: UUID) -> RiskDecisionRecord | None:
        model = self.session.scalar(
            select(RiskDecisionModel).where(RiskDecisionModel.run_id == run_id)
        )
        return RiskDecisionRecord.model_validate(model) if model else None
