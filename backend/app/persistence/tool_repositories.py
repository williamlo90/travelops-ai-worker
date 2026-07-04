from datetime import datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.domain.tooling import ExternalReceiptRecord, ToolAttemptRecord
from app.persistence.models import ExternalReceiptModel, ToolAttemptModel
from app.tools.contracts import SideEffectState


class ToolAttemptRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(
        self,
        *,
        run_id: UUID,
        tool_name: str,
        outcome: str,
        side_effect_state: SideEffectState,
        idempotency_key: str | None,
        request_data: dict[str, Any],
        response_data: dict[str, Any] | None,
        error_code: str | None,
        started_at: datetime,
        finished_at: datetime,
    ) -> ToolAttemptRecord:
        model = ToolAttemptModel(
            run_id=run_id,
            tool_name=tool_name,
            outcome=outcome,
            side_effect_state=side_effect_state.value,
            idempotency_key=idempotency_key,
            request_data=request_data,
            response_data=response_data,
            error_code=error_code,
            started_at=started_at,
            finished_at=finished_at,
        )
        self.session.add(model)
        self.session.flush()
        return ToolAttemptRecord.model_validate(model)

    def list_for_run(self, run_id: UUID) -> list[ToolAttemptRecord]:
        models = self.session.scalars(
            select(ToolAttemptModel)
            .where(ToolAttemptModel.run_id == run_id)
            .order_by(ToolAttemptModel.started_at, ToolAttemptModel.id)
        )
        return [ToolAttemptRecord.model_validate(model) for model in models]


class ExternalReceiptRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def add(
        self,
        *,
        tool_attempt_id: UUID,
        provider: str,
        tool_name: str,
        external_reference: str,
        idempotency_key: str,
        status: str,
        data: dict[str, Any],
    ) -> ExternalReceiptRecord:
        model = ExternalReceiptModel(
            tool_attempt_id=tool_attempt_id,
            provider=provider,
            tool_name=tool_name,
            external_reference=external_reference,
            idempotency_key=idempotency_key,
            status=status,
            data=data,
        )
        self.session.add(model)
        self.session.flush()
        return ExternalReceiptRecord.model_validate(model)

    def get_by_idempotency_key(
        self, *, provider: str, tool_name: str, idempotency_key: str
    ) -> ExternalReceiptRecord | None:
        model = self.session.scalar(
            select(ExternalReceiptModel).where(
                ExternalReceiptModel.provider == provider,
                ExternalReceiptModel.tool_name == tool_name,
                ExternalReceiptModel.idempotency_key == idempotency_key,
            )
        )
        return ExternalReceiptRecord.model_validate(model) if model else None
