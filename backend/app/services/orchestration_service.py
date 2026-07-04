from typing import cast
from uuid import uuid4

from langgraph.checkpoint.postgres import PostgresSaver

from app.domain.proposals import ProposalVersionRecord
from app.domain.runs import AgentRunCreate, AgentRunRecord, RunStatus
from app.models.gateway import ModelGateway
from app.orchestration.refund_graph import (
    GRAPH_VERSION,
    PROMPT_VERSION,
    RISK_RULE_VERSION,
    build_refund_graph,
)
from app.orchestration.state import RefundGraphState
from app.persistence.checkpoints import checkpoint_connection_string
from app.persistence.database import Database
from app.persistence.orchestration_repositories import OrchestrationRepository
from app.persistence.repositories import RunRepository
from app.services.run_service import RunService


class OrchestrationResult:
    def __init__(self, *, run: AgentRunRecord, proposal: ProposalVersionRecord) -> None:
        self.run = run
        self.proposal = proposal


class OrchestrationService:
    def __init__(self, database: Database, model_gateway: ModelGateway) -> None:
        self.database = database
        self.model_gateway = model_gateway

    def start_or_resume(
        self,
        *,
        task_public_id: str,
        correlation_id: str,
        run_public_id: str | None = None,
    ) -> OrchestrationResult:
        with self.database.session() as session:
            context = OrchestrationRepository(session).load_context(task_public_id)
            if context is None:
                raise LookupError(f"Task {task_public_id} does not exist or lacks context.")

        if run_public_id is None:
            run = RunService(self.database).create_run(
                AgentRunCreate(
                    public_id=f"AR-{uuid4().hex[:8].upper()}",
                    task_id=context.task_id,
                    correlation_id=correlation_id,
                )
            )
            run = RunService(self.database).transition(
                public_id=run.public_id,
                expected_version=run.version,
                target=RunStatus.RUNNING,
            )
        else:
            with self.database.session() as session:
                existing_run = RunRepository(session).get_by_public_id(run_public_id)
            if existing_run is None or existing_run.task_id != context.task_id:
                raise LookupError(f"Agent run {run_public_id} does not belong to {task_public_id}.")
            run = existing_run

        with self.database.session() as session:
            repository = OrchestrationRepository(session)
            existing_proposal = repository.get_proposal_for_run(run.id)
            if existing_proposal is not None:
                return OrchestrationResult(run=run, proposal=existing_proposal)
            repository.set_run_provenance(
                run_id=run.id,
                model_provider=self.model_gateway.provider_name,
                model_version=self.model_gateway.model_version,
                prompt_version=PROMPT_VERSION,
                graph_version=GRAPH_VERSION,
            )

        connection_string = self._checkpoint_connection_string()
        with PostgresSaver.from_conn_string(connection_string) as checkpointer:
            graph = build_refund_graph(self.model_gateway, checkpointer)
            state = RefundGraphState(
                task_id=str(context.task_id),
                run_id=str(run.id),
                customer_message=context.customer_message,
                booking_reference=context.booking_reference,
                booking_status=context.booking_status,
                customer_tier=context.customer_tier,
                amount=str(context.amount),
                currency=context.currency,
            )
            result = cast(
                RefundGraphState,
                graph.invoke(
                    state,
                    config={"configurable": {"thread_id": run.public_id}},
                ),
            )

        proposal_data = result["proposal"]
        with self.database.session() as session:
            proposal = OrchestrationRepository(session).persist_result(
                task_id=context.task_id,
                run_id=run.id,
                risk_codes=result["risk_codes"],
                requires_approval=result["requires_approval"],
                risk_explanation=result["risk_explanation"],
                rule_version=RISK_RULE_VERSION,
                proposal=proposal_data,
                amount=context.amount,
                currency=context.currency,
                model_provider=self.model_gateway.provider_name,
                model_version=self.model_gateway.model_version,
                prompt_version=PROMPT_VERSION,
                graph_version=GRAPH_VERSION,
            )
            refreshed_run = RunRepository(session).get_by_public_id(run.public_id)
        assert refreshed_run is not None
        return OrchestrationResult(run=refreshed_run, proposal=proposal)

    def get_run(self, public_id: str) -> AgentRunRecord | None:
        with self.database.session() as session:
            return RunRepository(session).get_by_public_id(public_id)

    def get_proposal(self, *, task_public_id: str, version: int) -> ProposalVersionRecord | None:
        with self.database.session() as session:
            return OrchestrationRepository(session).get_proposal(
                task_public_id=task_public_id, version=version
            )

    def _checkpoint_connection_string(self) -> str:
        return checkpoint_connection_string(
            self.database.engine.url.render_as_string(hide_password=False)
        )
