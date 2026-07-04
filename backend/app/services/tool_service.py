from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel

from app.persistence.database import Database
from app.persistence.tool_repositories import (
    ExternalReceiptRepository,
    ToolAttemptRepository,
)
from app.tools.contracts import RefundReceiptOutput, SideEffectState
from app.tools.errors import ToolExecutionError
from app.tools.redaction import redact
from app.tools.registry import ToolRegistry


class ToolService:
    def __init__(
        self,
        database: Database,
        registry: ToolRegistry,
        *,
        provider_name: str = "deterministic_travel_provider",
    ) -> None:
        self.database = database
        self.registry = registry
        self.provider_name = provider_name

    def invoke(
        self,
        *,
        run_id: UUID,
        tool_name: str,
        payload: dict[str, Any],
    ) -> BaseModel:
        tool = self.registry.get(tool_name)
        validated_input = tool.input_model.model_validate(payload)
        safe_request = redact(validated_input.model_dump(mode="json"))
        idempotency_key = getattr(validated_input, "idempotency_key", None)
        started_at = datetime.now(UTC)
        failure: ToolExecutionError | None = None
        output: BaseModel | None = None

        try:
            raw_output = tool.handler(validated_input)
            output = tool.output_model.model_validate(raw_output)
        except ToolExecutionError as error:
            failure = error

        finished_at = datetime.now(UTC)
        with self.database.session() as session:
            attempts = ToolAttemptRepository(session)
            if failure is not None:
                outcome = (
                    "uncertain"
                    if failure.side_effect_state is SideEffectState.POSSIBLE
                    else "rejected"
                )
                attempts.add(
                    run_id=run_id,
                    tool_name=tool_name,
                    outcome=outcome,
                    side_effect_state=failure.side_effect_state,
                    idempotency_key=idempotency_key,
                    request_data=safe_request,
                    response_data=None,
                    error_code=failure.code,
                    started_at=started_at,
                    finished_at=finished_at,
                )
            else:
                assert output is not None
                attempt = attempts.add(
                    run_id=run_id,
                    tool_name=tool_name,
                    outcome="succeeded",
                    side_effect_state=(
                        SideEffectState.CONFIRMED if tool.has_side_effect else SideEffectState.NONE
                    ),
                    idempotency_key=idempotency_key,
                    request_data=safe_request,
                    response_data=redact(output.model_dump(mode="json")),
                    error_code=None,
                    started_at=started_at,
                    finished_at=finished_at,
                )
                if isinstance(output, RefundReceiptOutput):
                    receipts = ExternalReceiptRepository(session)
                    existing = receipts.get_by_idempotency_key(
                        provider=self.provider_name,
                        tool_name=tool_name,
                        idempotency_key=output.idempotency_key,
                    )
                    if existing is None:
                        receipts.add(
                            tool_attempt_id=attempt.id,
                            provider=self.provider_name,
                            tool_name=tool_name,
                            external_reference=output.external_reference,
                            idempotency_key=output.idempotency_key,
                            status=output.status.value,
                            data=output.model_dump(mode="json"),
                        )

        if failure is not None:
            raise failure
        assert output is not None
        return output
